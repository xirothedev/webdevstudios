package auth

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/redis/go-redis/v9"
	"github.com/xirothedev/webdevstudios/apps/api-go/internal/web"
	"gorm.io/gorm"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/mailer"
)

type Handler struct {
	svc *Service
}

func Register(v1 *gin.RouterGroup, db *gorm.DB, secret string, rdb *redis.Client, mail *mailer.Service, strict gin.HandlerFunc) {
	h := &Handler{svc: NewService(db, secret, rdb, mail)}
	g := v1.Group("/auth")
	g.POST("/register", strict, h.register)
	g.POST("/login", strict, h.login)
	g.POST("/password/reset-request", strict, h.resetRequest)
	g.POST("/password/reset", strict, h.resetPassword)
	g.GET("/sessions", AuthRequired(db, secret), h.sessions)
	g.GET("/verify-email", h.verifyEmail)
	g.POST("/2fa/enable", strict, AuthRequired(db, secret), h.enable2FA)
	oauth := func(provider string) gin.HandlerFunc {
		return func(c *gin.Context) {
			vars := map[string]string{
				"google": "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET",
				"github": "GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET",
			}
			nestError(c, http.StatusNotImplemented, "OAuth "+provider+" requires "+vars[provider]+" and callback wiring (deferred)")
		}
	}
	g.GET("/oauth/google", oauth("google"))
	g.GET("/oauth/google/callback", oauth("google"))
	g.GET("/oauth/github", oauth("github"))
	g.GET("/oauth/github/callback", oauth("github"))
	g.POST("/2fa/verify", strict, AuthRequired(db, secret), h.verify2FA)
	g.POST("/refresh", h.refresh)
	g.POST("/logout", AuthRequired(db, secret), h.logout)
}

func (h *Handler) register(c *gin.Context) {
	var in RegisterInput
	if !web.Bind(c, &in) {
		return
	}
	userID, err := h.svc.Register(in)
	if errors.Is(err, ErrEmailTaken) {
		nestError(c, http.StatusConflict, "User with this email already exists")
		return
	}
	if err != nil {
		nestError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusCreated, RegisterResponse{UserID: userID})
}

func (h *Handler) login(c *gin.Context) {
	var in LoginInput
	if !web.Bind(c, &in) {
		return
	}
	resp, err := h.svc.Login(in, c.ClientIP(), c.Request.UserAgent())
	switch {
	case errors.Is(err, ErrInvalidCreds):
		nestError(c, http.StatusUnauthorized, "Invalid credentials")
		return
	case errors.Is(err, ErrEmailUnverified):
		nestError(c, http.StatusBadRequest, "Please verify your email before logging in")
		return
	case err != nil:
		nestError(c, http.StatusInternalServerError, err.Error())
		return
	}
	if !resp.Requires2FA && resp.AccessToken != "" {
		setAuthCookies(c, resp.AccessToken, resp.RefreshToken, resp.TTLSeconds)
	}
	c.JSON(http.StatusOK, resp)
}

func (h *Handler) refresh(c *gin.Context) {
	token := c.Query("placeholder")
	_ = token
	var body struct {
		RefreshToken string `json:"refreshToken"`
	}
	_ = c.ShouldBindJSON(&body)
	rt := body.RefreshToken
	if rt == "" {
		if ck, err := c.Cookie("refresh_token"); err == nil {
			rt = ck
		}
	}
	if rt == "" {
		nestError(c, http.StatusUnauthorized, "Invalid refresh token")
		return
	}
	resp, err := h.svc.Refresh(rt)
	switch {
	case errors.Is(err, ErrInvalidRefresh):
		nestError(c, http.StatusUnauthorized, "Invalid or expired session")
		return
	case errors.Is(err, ErrSessionExpired):
		nestError(c, http.StatusUnauthorized, "Session expired")
		return
	case errors.Is(err, ErrUserNotFound):
		nestError(c, http.StatusUnauthorized, "User not found")
		return
	case err != nil:
		nestError(c, http.StatusInternalServerError, err.Error())
		return
	}
	setAuthCookies(c, resp.AccessToken, resp.RefreshToken, resp.TTLSeconds)
	c.JSON(http.StatusOK, resp)
}

func (h *Handler) enable2FA(c *gin.Context) {
	userID, _ := c.Get("userId")
	uid, _ := userID.(string)
	email, _ := c.Get("email")
	em, _ := email.(string)
	secret, qr, codes, err := h.svc.Enable2FA(uid, em)
	if errors.Is(err, ErrMfaAlreadyEnabled) {
		nestError(c, http.StatusBadRequest, "2FA is already enabled")
		return
	}
	if err != nil {
		nestError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, gin.H{"qrCode": qr, "secret": secret, "backupCodes": codes})
}

func (h *Handler) verify2FA(c *gin.Context) {
	var in struct {
		Code string `json:"code" binding:"required"`
	}
	if !web.Bind(c, &in) {
		return
	}
	userID, _ := c.Get("userId")
	sessionID, _ := c.Get("sessionId")
	uid, _ := userID.(string)
	sid, _ := sessionID.(string)
	if err := h.svc.Verify2FA(uid, in.Code, sid); err != nil {
		nestError(c, http.StatusUnauthorized, "Invalid 2FA code")
		return
	}
	c.JSON(http.StatusOK, SuccessResponse{Success: true})
}

func (h *Handler) resetRequest(c *gin.Context) {
	var in struct {
		Email string `json:"email" binding:"required,email"`
	}
	if !web.Bind(c, &in) {
		return
	}
	if err := h.svc.RequestPasswordReset(in.Email); err != nil {
		nestError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, SuccessResponse{Success: true})
}

func (h *Handler) resetPassword(c *gin.Context) {
	var in struct {
		Token       string `json:"token" binding:"required"`
		NewPassword string `json:"newPassword" binding:"required,min=8"`
	}
	if !web.Bind(c, &in) {
		return
	}
	if err := h.svc.ResetPassword(in.Token, in.NewPassword); err != nil {
		nestError(c, http.StatusNotFound, "Invalid or expired reset token")
		return
	}
	c.JSON(http.StatusOK, SuccessResponse{Success: true})
}

func (h *Handler) sessions(c *gin.Context) {
	uid, _ := c.Get("userId")
	sessions, err := h.svc.ListSessions(uid.(string))
	if err != nil {
		nestError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, sessions)
}

func (h *Handler) verifyEmail(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		nestError(c, http.StatusBadRequest, "token is required")
		return
	}
	if err := h.svc.VerifyEmail(token); err != nil {
		nestError(c, http.StatusBadRequest, "Invalid or expired verification token")
		return
	}
	c.JSON(http.StatusOK, SuccessResponse{Success: true})
}

func (h *Handler) logout(c *gin.Context) {
	userID, _ := c.Get("userId")
	sessionID, _ := c.Get("sessionId")
	sid, _ := sessionID.(string)
	uid, _ := userID.(string)
	if err := h.svc.Logout(uid, sid); err != nil {
		nestError(c, http.StatusInternalServerError, err.Error())
		return
	}
	clearAuthCookies(c)
	c.JSON(http.StatusOK, SuccessResponse{Success: true})
}

// AuthRequired mirrors jwt.strategy: cookie first, Authorization header fallback,
// then a DB lookup of sub on every request.
func AuthRequired(db *gorm.DB, secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := ""
		if ck, err := c.Cookie("access_token"); err == nil && ck != "" {
			token = ck
		} else if authz := c.GetHeader("Authorization"); strings.HasPrefix(authz, "Bearer ") {
			token = strings.TrimPrefix(authz, "Bearer ")
		}
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, nestBody(http.StatusUnauthorized, "Unauthorized"))
			return
		}
		claims, err := VerifyToken(secret, token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, nestBody(http.StatusUnauthorized, "Unauthorized"))
			return
		}
		var user User
		if err := db.First(&user, map[string]any{"id": claims.Sub}).Error; err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, nestBody(http.StatusUnauthorized, "User not found"))
			return
		}
		c.Set("userId", user.ID)
		c.Set("email", user.Email)
		c.Set("role", user.Role)
		c.Set("sessionId", claims.JTI)
		c.Next()
	}
}

const accessCookieMaxAge = 15 * 60 // seconds; matches ACCESS_COOKIE_MAX_AGE_MS

func setAuthCookies(c *gin.Context, access, refresh string, ttlSeconds int) {
	secure := gin.Mode() == gin.ReleaseMode // NODE_ENV=production equivalent
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("access_token", access, accessCookieMaxAge, "/", "", secure, true)
	c.SetCookie("refresh_token", refresh, ttlSeconds, "/", "", secure, true)
}

func clearAuthCookies(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("access_token", "", -1, "/", "", false, true)
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)
}

func nestBody(code int, message string) gin.H {
	return gin.H{"statusCode": code, "message": message, "error": http.StatusText(code)}
}

func nestError(c *gin.Context, code int, message string) {
	c.JSON(code, nestBody(code, message))
}

// RequireRole must run AFTER AuthRequired; aborts unless the caller's role matches.
func RequireRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.GetString("role") != role {
			c.AbortWithStatusJSON(http.StatusForbidden, nestBody(http.StatusForbidden, "Forbidden resource"))
			return
		}
		c.Next()
	}
}

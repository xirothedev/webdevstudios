package users

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/web"
	"gorm.io/gorm"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/storage"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/auth"
)

type Handler struct {
	db    *gorm.DB
	store *storage.Service
}

// Register owns every /users route; auth.Register no longer mounts /users/me.
func Register(v1 *gin.RouterGroup, db *gorm.DB, secret string, authRequired gin.HandlerFunc, store *storage.Service) {
	h := &Handler{db: db, store: store}
	u := v1.Group("/users", authRequired)
	u.GET("/me", h.me)
	u.PATCH("/profile", h.updateProfile)
	u.PATCH("/avatar", h.updateAvatar)
	u.GET("", h.adminList)
	// /users/:id is @Public in Nest but needs OPTIONAL auth to pick Private vs Public shape
	v1.GET("/users/:id", h.optionalAuth(db, secret), h.getByID)
}

func (h *Handler) me(c *gin.Context) {
	user, err := h.byID(c.GetString("userId"))
	if replyErr(c, user, err) {
		return
	}
	c.JSON(http.StatusOK, privateDTO(user))
}

func (h *Handler) updateProfile(c *gin.Context) {
	var in struct {
		FullName *string `json:"fullName" binding:"omitempty,min=1,max=100"`
		Phone    *string `json:"phone" binding:"omitempty,max=15"`
	}
	if !web.Bind(c, &in) {
		return
	}
	updates := map[string]any{}
	if in.FullName != nil {
		updates["fullName"] = *in.FullName
	}
	if in.Phone != nil {
		updates["phone"] = *in.Phone
	}
	if len(updates) > 0 {
		if err := h.db.Model(&auth.User{}).Where(map[string]any{"id": c.GetString("userId")}).Updates(updates).Error; err != nil {
			nestError(c, http.StatusInternalServerError, err.Error())
			return
		}
	}
	user, err := h.byID(c.GetString("userId"))
	if replyErr(c, user, err) {
		return
	}
	c.JSON(http.StatusOK, privateDTO(user))
}

func (h *Handler) getByID(c *gin.Context) {
	id := c.Param("id")
	user, err := h.byID(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		nestError(c, http.StatusNotFound, "User with id "+id+" not found")
		return
	}
	if err != nil {
		nestError(c, http.StatusInternalServerError, err.Error())
		return
	}
	viewerID, _ := c.Get("viewerId")
	role, _ := c.Get("viewerRole")
	if viewerID == id || role == "ADMIN" {
		c.JSON(http.StatusOK, privateDTO(user))
		return
	}
	c.JSON(http.StatusOK, gin.H{"id": user.ID, "fullName": user.FullName, "avatar": user.Avatar})
}

func (h *Handler) byID(id string) (*auth.User, error) {
	var u auth.User
	err := h.db.First(&u, map[string]any{"id": id}).Error
	return &u, err
}

func (h *Handler) optionalAuth(db *gorm.DB, secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := ""
		if ck, err := c.Cookie("access_token"); err == nil && ck != "" {
			token = ck
		} else if ah := c.GetHeader("Authorization"); len(ah) > 7 && ah[:7] == "Bearer " {
			token = ah[7:]
		}
		if token != "" {
			if claims, err := auth.VerifyToken(secret, token); err == nil {
				var u auth.User
				if err := db.First(&u, map[string]any{"id": claims.Sub}).Error; err == nil {
					c.Set("viewerId", u.ID)
					c.Set("viewerRole", u.Role)
				}
			}
		}
		c.Next()
	}
}

func privateDTO(u *auth.User) gin.H {
	return gin.H{
		"id":            u.ID,
		"email":         u.Email,
		"fullName":      u.FullName,
		"phone":         u.Phone,
		"avatar":        u.Avatar,
		"role":          u.Role,
		"emailVerified": u.EmailVerified,
		"phoneVerified": u.PhoneVerified,
		"mfaEnabled":    u.MfaEnabled,
		"createdAt":     u.CreatedAt,
		"updatedAt":     u.UpdatedAt,
	}
}

func replyErr(c *gin.Context, _ *auth.User, err error) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		nestError(c, http.StatusUnauthorized, "User not found")
		return true
	}
	nestError(c, http.StatusInternalServerError, err.Error())
	return true
}

func nestError(c *gin.Context, code int, message string) {
	c.JSON(code, gin.H{"statusCode": code, "message": message, "error": http.StatusText(code)})
}

// updateAvatar mirrors PATCH /users/avatar: jpg/png/webp <=5MB into R2; the DB
// stores the KEY and resolveMediaUrl derives the public URL.
func (h *Handler) updateAvatar(c *gin.Context) {
	if h.store == nil || !h.store.Enabled() {
		nestError(c, http.StatusNotImplemented, "avatar upload requires R2_* env vars (storage)")
		return
	}
	fh, err := c.FormFile("file")
	if err != nil {
		nestError(c, http.StatusBadRequest, "file is required")
		return
	}
	if fh.Size > 5*1024*1024 {
		nestError(c, http.StatusBadRequest, "File too large. Max 5MB")
		return
	}
	ext := ""
	switch ct := fh.Header.Get("Content-Type"); ct {
	case "image/jpeg":
		ext = "jpg"
	case "image/png":
		ext = "png"
	case "image/webp":
		ext = "webp"
	default:
		nestError(c, http.StatusBadRequest, "Only jpg, png, webp images are allowed")
		return
	}
	f, err := fh.Open()
	if err != nil {
		nestError(c, http.StatusBadRequest, err.Error())
		return
	}
	defer f.Close()
	buf := make([]byte, fh.Size)
	if _, err := f.Read(buf); err != nil && err.Error() != "EOF" {
		nestError(c, http.StatusInternalServerError, err.Error())
		return
	}
	userID := c.GetString("userId")
	key := "avatars/" + userID + "/" + strconv.FormatInt(time.Now().Unix(), 10) + "." + ext
	if err := h.store.PutObject(key, buf, fh.Header.Get("Content-Type")); err != nil {
		nestError(c, http.StatusInternalServerError, err.Error())
		return
	}
	if err := h.db.Model(&auth.User{}).Where(map[string]any{"id": userID}).Update("avatar", key).Error; err != nil {
		nestError(c, http.StatusInternalServerError, err.Error())
		return
	}
	user, _ := h.byID(userID)
	dto := privateDTO(user)
	dto["avatar"] = h.store.ResolveMediaURL(userAvatar(user))
	c.JSON(http.StatusOK, dto)
}

func userAvatar(u *auth.User) string {
	if u.Avatar == nil {
		return ""
	}
	return *u.Avatar
}

// adminList backs GET /v1/users (ADMIN only): paginated private profiles.
func (h *Handler) adminList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	where := map[string]any{}
	if role := c.Query("role"); role != "" {
		where["role"] = role
	}
	var total int64
	if err := h.db.Model(&auth.User{}).Where(where).Count(&total).Error; err != nil {
		nestError(c, http.StatusInternalServerError, err.Error())
		return
	}
	var rows []auth.User
	if err := h.db.Where(where).Order(`"createdAt" DESC`).Offset((page - 1) * limit).Limit(limit).Find(&rows).Error; err != nil {
		nestError(c, http.StatusInternalServerError, err.Error())
		return
	}
	users := make([]gin.H, 0, len(rows))
	for i := range rows {
		users = append(users, privateDTO(&rows[i]))
	}
	tp := (total + int64(limit) - 1) / int64(limit)
	c.JSON(http.StatusOK, gin.H{"users": users, "pagination": gin.H{
		"page": page, "limit": limit, "total": total, "totalPages": tp,
	}})
}

package auth

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ---------- Password reset ----------

var ErrInvalidResetToken = errors.New("invalid reset token")

func (s *Service) RequestPasswordReset(email string) error {
	var user User
	err := s.db.Where(map[string]any{"email": email}).First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil // never reveal whether the account exists
	}
	if err != nil {
		return err
	}
	token, err := randomHex(32)
	if err != nil {
		return err
	}
	if s.rdb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()
		s.rdb.Set(ctx, "passwordreset:"+token, user.ID, 24*time.Hour)
	}
	if s.mail != nil && s.mail.Enabled() {
		link := s.mail.FrontendURL() + "/auth/reset-password?token=" + token
		return s.mail.Send(email, "Password reset",
			fmt.Sprintf("<p>Reset your password:</p><p><a href=\"%s\">%s</a></p><p>Expires in 24 hours.</p>", link, link))
	}
	log.Printf("[dev] password reset token for %s: /v1/auth/password/reset?token=%s", email, token)
	return nil
}

func (s *Service) ResetPassword(token, newPassword string) error {
	var userID string
	if s.rdb == nil {
		return ErrInvalidResetToken
	}
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	var err error
	userID, err = s.rdb.Get(ctx, "passwordreset:"+token).Result()
	if err != nil {
		return ErrInvalidResetToken
	}
	hashed, err := HashPassword(newPassword)
	if err != nil {
		return err
	}
	now := time.Now()
	txErr := s.db.Transaction(func(tx *gorm.DB) error {
		if e := tx.Model(&User{}).Where(map[string]any{"id": userID}).Update("password", hashed).Error; e != nil {
			return e
		}
		return tx.Model(&Session{}).Where(map[string]any{"userId": userID}).
			Updates(map[string]any{"status": "REVOKED", "revokedAt": now}).Error
	})
	if txErr == nil {
		s.rdb.Del(ctx, "passwordreset:"+token)
	}
	return txErr
}

// Sessions mirrors getSessions: active sessions with optional device info.
type SessionDTO struct {
	ID        string     `json:"id"`
	Device    *DeviceDTO `json:"device"`
	IPAddress *string    `json:"ipAddress"`
	UserAgent *string    `json:"userAgent"`
	Status    string     `json:"status"`
	CreatedAt time.Time  `json:"createdAt"`
	ExpiresAt time.Time  `json:"expiresAt"`
}

type DeviceDTO struct {
	ID         string    `json:"id"`
	Name       *string   `json:"name"`
	Type       string    `json:"type"`
	LastSeenAt time.Time `json:"lastSeenAt"`
}

func (s *Service) ListSessions(userID string) ([]SessionDTO, error) {
	var rows []Session
	err := s.db.Where(map[string]any{"userId": userID}).Order(`"createdAt" DESC`).Find(&rows).Error
	if err != nil {
		return nil, err
	}
	out := make([]SessionDTO, 0, len(rows))
	for _, r := range rows {
		dto := SessionDTO{
			ID: r.ID, IPAddress: r.IPAddress, UserAgent: r.UserAgent,
			Status: r.Status, CreatedAt: r.CreatedAt, ExpiresAt: r.ExpiresAt,
		}
		if r.DeviceID != nil {
			var d Device
			if s.db.First(&d, map[string]any{"id": *r.DeviceID}).Error == nil {
				dto.Device = &DeviceDTO{ID: d.ID, Name: d.Name, Type: d.Type, LastSeenAt: d.LastSeenAt}
			}
		}
		out = append(out, dto)
	}
	return out, nil
}

// ---------- CSRF (double-submit, csrf-csrf compatible) ----------

type CSRF struct {
	secret string
}

func NewCSRF(secret string) *CSRF { return &CSRF{secret: secret} }

// Token returns `<hmac>.<random>`; the same value is planted in the `_csrf`
// cookie and echoed by the client via x-csrf-token.
func (c *CSRF) Token() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	random := hex.EncodeToString(b)
	mac := hmac.New(sha256.New, []byte(c.secret))
	mac.Write([]byte(random))
	return hex.EncodeToString(mac.Sum(nil)) + "." + random, nil
}

func (c *CSRF) valid(token string) bool {
	parts := strings.SplitN(token, ".", 2)
	if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
		return false
	}
	mac := hmac.New(sha256.New, []byte(c.secret))
	mac.Write([]byte(parts[1]))
	expected := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(parts[0]))
}

// Middleware mirrors csrf.middleware.ts exemptions exactly.
func (c *CSRF) Middleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		switch ctx.Request.Method {
		case http.MethodGet, http.MethodHead, http.MethodOptions:
			ctx.Next()
			return
		}
		// Exemptions mirror csrf.middleware.ts exactly — nothing else skips.
		path := ctx.Request.URL.Path
		for _, p := range []string{"/v1/auth/oauth", "/v1/payments/webhook", "/v1/docs"} {
			if strings.HasPrefix(path, p) {
				ctx.Next()
				return
			}
		}
		if path == "/v1/auth/refresh" {
			ctx.Next()
			return
		}
		header := ctx.GetHeader("X-CSRF-Token")
		cookie, err := ctx.Cookie("_csrf")
		if err != nil || header == "" || header != cookie || !c.valid(header) {
			ctx.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"statusCode": http.StatusForbidden,
				"message":    "Invalid CSRF token",
				"error":      http.StatusText(http.StatusForbidden),
			})
			return
		}
		ctx.Next()
	}
}

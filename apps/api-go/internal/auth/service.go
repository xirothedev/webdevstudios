package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/mailer"
)

var (
	ErrEmailTaken      = errors.New("email taken")
	ErrInvalidCreds    = errors.New("invalid credentials")
	ErrEmailUnverified = errors.New("email not verified")
	ErrInvalidRefresh  = errors.New("invalid refresh token")
	ErrSessionExpired  = errors.New("session expired")
	ErrUserNotFound    = errors.New("user not found")
	ErrInvalidVerify   = errors.New("invalid or expired verification token")
)

type Service struct {
	db     *gorm.DB
	secret string
	rdb    *redis.Client // nil = no Redis: tokens fall back to server logs
	mail   *mailer.Service
}

func NewService(db *gorm.DB, secret string, rdb *redis.Client, mail *mailer.Service) *Service {
	return &Service{db: db, secret: secret, rdb: rdb, mail: mail}
}

func (s *Service) Register(in RegisterInput) (string, error) {
	var count int64
	s.db.Model(&User{}).Where(map[string]any{"email": in.Email}).Count(&count)
	if count > 0 {
		return "", ErrEmailTaken
	}
	hashed, err := HashPassword(in.Password)
	if err != nil {
		return "", err
	}
	user := User{
		ID:            uuid.NewString(),
		Email:         in.Email,
		Password:      &hashed,
		FullName:      &in.FullName,
		Phone:         in.Phone,
		Role:          "CUSTOMER",
		EmailVerified: false,
	}
	if err := s.db.Create(&user).Error; err != nil {
		return "", err
	}
	token, err := randomHex(32)
	if err != nil {
		return "", err
	}
	if s.mail != nil && s.mail.Enabled() {
		if err := s.mail.SendVerificationEmail(in.Email, token); err != nil {
			log.Printf("auth: verification mail failed for %s: %v", in.Email, err)
		}
	} else {
		log.Printf("[dev] mailer disabled; verification link for %s: /v1/auth/verify-email?token=%s", in.Email, token)
	}
	if s.rdb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()
		s.rdb.Set(ctx, "emailverify:"+token, user.ID, 24*time.Hour)
	}
	return user.ID, nil
}

// VerifyEmail consumes the Redis token and flips emailVerified, matching the
// Nest TokenStorage flow.
func (s *Service) VerifyEmail(token string) error {
	var userID string
	if s.rdb != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()
		val, err := s.rdb.Get(ctx, "emailverify:"+token).Result()
		if err != nil {
			return ErrInvalidVerify
		}
		userID = val
		s.rdb.Del(ctx, "emailverify:"+token)
	} else {
		return ErrInvalidVerify
	}
	res := s.db.Model(&User{}).Where(map[string]any{"id": userID}).Update("emailVerified", true)
	if res.Error != nil {
		return res.Error
	}
	return nil
}

func (s *Service) Login(in LoginInput, ip, userAgent string) (*LoginResponse, error) {
	var user User
	err := s.db.Where(map[string]any{"email": in.Email}).First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrInvalidCreds
	}
	if err != nil {
		return nil, err
	}
	if user.Password == nil {
		return nil, ErrInvalidCreds
	}
	if VerifyPassword(*user.Password, in.Password) != nil {
		return nil, ErrInvalidCreds
	}
	if !user.EmailVerified {
		return nil, ErrEmailUnverified
	}
	if user.MfaEnabled {
		return &LoginResponse{
			User:        brief(&user),
			Requires2FA: true,
		}, nil
	}
	ttl := 7 * 24 * time.Hour
	if in.RememberMe {
		ttl = 30 * 24 * time.Hour
	}
	resp, err := s.issueSession(&user, ip, userAgent, ttl)
	if err != nil {
		return nil, err
	}
	resp.TTLSeconds = int(ttl.Seconds())
	return resp, nil
}

func (s *Service) Refresh(refreshToken string) (*RefreshResponse, error) {
	payload, err := VerifyToken(s.secret, refreshToken)
	if err != nil {
		return nil, ErrInvalidRefresh
	}
	var session Session
	err = s.db.Where(map[string]any{"refreshToken": refreshToken}).First(&session).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrInvalidRefresh
	}
	if err != nil {
		return nil, err
	}
	if session.Status != "ACTIVE" {
		return nil, ErrInvalidRefresh
	}
	if time.Now().After(session.ExpiresAt) {
		return nil, ErrSessionExpired
	}
	var user User
	if err := s.db.First(&user, map[string]any{"id": session.UserID}).Error; err != nil {
		return nil, ErrUserNotFound
	}
	newAccess, err := SignAccess(s.secret, payload.Sub, user.Email, user.Role, session.ID, time.Hour)
	if err != nil {
		return nil, err
	}
	newRefresh, err := SignRefresh(s.secret, payload.Sub, 7*24*time.Hour)
	if err != nil {
		return nil, err
	}
	if err := s.db.Model(&Session{}).Where(map[string]any{"id": session.ID}).
		Update("refreshToken", newRefresh).Error; err != nil {
		return nil, err
	}
	return &RefreshResponse{
		AccessToken:  newAccess,
		RefreshToken: newRefresh,
		TTLSeconds:   max(0, int(time.Until(session.ExpiresAt).Seconds())),
	}, nil
}

func (s *Service) Logout(userID, sessionID string) error {
	if sessionID != "" {
		return s.db.Model(&Session{}).Where(map[string]any{"id": sessionID}).Updates(map[string]any{"status": "REVOKED", "revokedAt": time.Now()}).Error
	}
	return s.db.Model(&Session{}).Where(map[string]any{"userId": userID}).Updates(map[string]any{"status": "REVOKED", "revokedAt": time.Now()}).Error
}

// issueSession mirrors NestJS SessionIssuer: access carries jti=sessionID, the
// session row stores both tokens; Device rows are a Phase 8 nicety.
func (s *Service) issueSession(user *User, ip, userAgent string, ttl time.Duration) (*LoginResponse, error) {
	sessionID := uuid.NewString()
	access, err := SignAccess(s.secret, user.ID, user.Email, user.Role, sessionID, time.Hour)
	if err != nil {
		return nil, err
	}
	refresh, err := SignRefresh(s.secret, user.ID, ttl)
	if err != nil {
		return nil, err
	}
	deviceID := s.provisionDevice(user.ID, ip, userAgent)
	session := Session{
		ID:           sessionID,
		Token:        access,
		RefreshToken: &refresh,
		UserID:       user.ID,
		DeviceID:     deviceID,
		IPAddress:    strPtr(ip),
		UserAgent:    strPtr(userAgent),
		Status:       "ACTIVE",
		ExpiresAt:    time.Now().Add(ttl),
	}
	if err := s.db.Create(&session).Error; err != nil {
		return nil, err
	}
	return &LoginResponse{
		AccessToken:  access,
		RefreshToken: refresh,
		User:         brief(user),
	}, nil
}

func brief(u *User) UserBriefDTO {
	return UserBriefDTO{ID: u.ID, Email: u.Email, FullName: u.FullName, EmailVerified: u.EmailVerified, MfaEnabled: u.MfaEnabled}
}

func strPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// provisionDevice mirrors SessionIssuer's Device creation with a regex-grade
// UA parser — swap for a ua-parser port if device analytics ever matter.
type Device struct {
	ID          string    `gorm:"column:id"`
	Name        *string   `gorm:"column:name"`
	Type        string    `gorm:"column:type"`
	UserAgent   *string   `gorm:"column:userAgent"`
	IPAddress   *string   `gorm:"column:ipAddress"`
	Fingerprint *string   `gorm:"column:fingerprint"`
	UserID      string    `gorm:"column:userId"`
	LastSeenAt  time.Time `gorm:"column:lastSeenAt"`
	CreatedAt   time.Time `gorm:"column:createdAt"`
}

func (Device) TableName() string { return "devices" }

func newSessionID() string {
	b := make([]byte, 12)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func (s *Service) provisionDevice(userID, ip, userAgent string) *string {
	if userAgent == "" {
		return nil
	}
	kind := "DESKTOP"
	switch {
	case strings.Contains(userAgent, "iPad") || strings.Contains(userAgent, "Tablet"):
		kind = "TABLET"
	case strings.ContainsAny(userAgent, "Mobile"):
		kind = "MOBILE"
	}
	name := userAgent
	if len(name) > 255 {
		name = name[:255]
	}
	fp := shaShortHex(userAgent + "|" + ip)
	d := Device{
		ID: newSessionID(), Name: &name, Type: kind,
		UserAgent: &userAgent, IPAddress: strPtr(ip),
		Fingerprint: &fp, UserID: userID,
	}
	if err := s.db.Create(&d).Error; err != nil {
		return nil // session proceeds without a device link
	}
	return &d.ID
}

func shaShortHex(s string) string {
	sum := sha256.Sum256([]byte(s))
	return hex.EncodeToString(sum[:16])
}

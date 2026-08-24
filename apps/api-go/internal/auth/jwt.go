package auth

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	Sub   string
	Email string
	Role  string
	JTI   string
}

func SignAccess(secret, sub, email, role, sessionID string, ttl time.Duration) (string, error) {
	claims := jwt.MapClaims{
		"sub": sub,
		"exp": time.Now().Add(ttl).Unix(),
		"iat": time.Now().Unix(),
	}
	if email != "" {
		claims["email"] = email
	}
	if role != "" {
		claims["role"] = role
	}
	if sessionID != "" {
		claims["jti"] = sessionID // jti carries the Session id so identity survives refresh rotation
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
}

func SignRefresh(secret, sub string, ttl time.Duration) (string, error) {
	return jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": sub,
		"exp": time.Now().Add(ttl).Unix(),
		"iat": time.Now().Unix(),
	}).SignedString([]byte(secret))
}

func VerifyToken(secret, token string) (*Claims, error) {
	parsed, err := jwt.Parse(token, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secret), nil
	})
	if err != nil || !parsed.Valid {
		return nil, errors.New("invalid token")
	}
	mc, ok := parsed.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid claims")
	}
	sub, _ := mc["sub"].(string)
	c := &Claims{Sub: sub}
	c.Email, _ = mc["email"].(string)
	c.Role, _ = mc["role"].(string)
	c.JTI, _ = mc["jti"].(string)
	return c, nil
}

func randomHex(n int) (string, error) {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

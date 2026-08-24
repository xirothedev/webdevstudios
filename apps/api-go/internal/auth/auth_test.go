package auth

import (
	"strings"
	"testing"
	"time"
)

func TestHashPasswordRoundtrip(t *testing.T) {
	h, err := HashPassword("admin123@")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(h, "$argon2id$v=19$m=19456,t=2,p=1$") {
		t.Fatalf("unexpected encoded format: %q", h)
	}
	if VerifyPassword(h, "admin123@") != nil {
		t.Fatal("correct password rejected")
	}
	if VerifyPassword(h, "wrong") == nil {
		t.Fatal("wrong password accepted")
	}
}

func TestJWTSignVerify(t *testing.T) {
	tok, err := SignAccess("s3cret", "user1", "a@b.c", "ADMIN", "sess1", time.Minute)
	if err != nil {
		t.Fatal(err)
	}
	claims, err := VerifyToken("s3cret", tok)
	if err != nil {
		t.Fatal(err)
	}
	if claims.Sub != "user1" || claims.Email != "a@b.c" || claims.Role != "ADMIN" || claims.JTI != "sess1" {
		t.Fatalf("claims mismatch: %+v", claims)
	}
	if _, err := VerifyToken("s3cret", tok+"x"); err == nil {
		t.Fatal("tampered token accepted")
	}
	if _, err := VerifyToken("other-key", tok); err == nil {
		t.Fatal("wrong secret accepted")
	}
}

func TestVerify2FANormalizesCode(t *testing.T) {
	if normalizeCode(" ab-c123 ") != "ABC123" {
		t.Fatal("normalization broken")
	}
}

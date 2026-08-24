package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"math/big"
	"strings"
	"time"

	"github.com/pquerna/otp"
	"github.com/pquerna/otp/totp"
	qrcode "github.com/skip2/go-qrcode"
	"gorm.io/gorm"
)

var ErrMfaAlreadyEnabled = errors.New("2FA is already enabled")

type MfaMethod struct {
	ID         string    `gorm:"column:id"`
	UserID     string    `gorm:"column:userId"`
	MethodType string    `gorm:"column:methodType"`
	Secret     *string   `gorm:"column:secret"`
	IsActive   bool      `gorm:"column:isActive"`
	IsVerified bool      `gorm:"column:isVerified"`
	CreatedAt  time.Time `gorm:"column:createdAt"`
	UpdatedAt  time.Time `gorm:"column:updatedAt"` // NOT NULL, no DB default — GORM must write it
}

func (MfaMethod) TableName() string { return "mfa_methods" }

type BackupCode struct {
	ID        string    `gorm:"column:id"`
	UserID    string    `gorm:"column:userId"`
	Code      string    `gorm:"column:code"`
	IsUsed    bool      `gorm:"column:isUsed"`
	CreatedAt time.Time `gorm:"column:createdAt"`
}

func (BackupCode) TableName() string { return "mfa_backup_codes" }

// Enable2FA provisions an unverified TOTP method plus argon2-hashed backup
// codes, mirroring enable2FA: the method only activates after a successful
// Verify2FA.
func (s *Service) Enable2FA(userID, email string) (secret, qrDataURL string, codes []string, err error) {
	var user User
	if e := s.db.First(&user, map[string]any{"id": userID}).Error; e != nil {
		return "", "", nil, ErrUserNotFound
	}
	if user.MfaEnabled {
		return "", "", nil, ErrMfaAlreadyEnabled
	}
	key, e := totp.Generate(totp.GenerateOpts{
		Issuer:      "WebDev Studios",
		AccountName: email,
		Period:      30,
		Digits:      otp.DigitsSix,
		Algorithm:   otp.AlgorithmSHA1,
	})
	if e != nil {
		return "", "", nil, e
	}
	secret = key.Secret()
	codes = make([]string, 10)
	hashes := make([]BackupCode, 0, len(codes))
	for i := range codes {
		n, _ := rand.Int(rand.Reader, big.NewInt(90000000))
		codes[i] = fmt.Sprintf("%08d", n.Int64()+10000000)
		// ponytail: mfa_backup_codes.code is varchar(20) — Nest's argon2 hashes
		// cannot fit, so codes are stored raw. Migrate the column to text if
		// at-rest hashing is wanted.
		hashes = append(hashes, BackupCode{ID: newSessionID(), UserID: userID, Code: codes[i]})
	}
	method := MfaMethod{ID: newSessionID(), UserID: userID, MethodType: "TOTP", Secret: &secret}
	e = s.db.Transaction(func(tx *gorm.DB) error {
		if e := tx.Create(&method).Error; e != nil {
			return e
		}
		return tx.Create(&hashes).Error
	})
	if e != nil {
		return "", "", nil, e
	}
	url := fmt.Sprintf("otpauth://totp/WebDev%%20Studios:%s?secret=%s&issuer=WebDev%%20Studios&period=30&digits=6", urlEscape(email), secret)
	png, e := qrcode.Encode(url, qrcode.Medium, 256)
	if e != nil {
		return "", "", nil, e
	}
	return secret, "data:image/png;base64," + base64.StdEncoding.EncodeToString(png), codes, nil
}

// Verify2FA accepts a TOTP code or an unused backup code. First success
// activates the method and flips mfaEnabled — exactly one row write each.
func (s *Service) Verify2FA(userID, code, sessionID string) error {
	code = normalizeCode(code)
	secret := s.resolveSecret(userID)
	valid := false
	if secret != "" {
		ok, e := totp.ValidateCustom(code, secret, time.Now(), totp.ValidateOpts{
			Period: 30, Skew: 2, Digits: otp.DigitsSix, Algorithm: otp.AlgorithmSHA1,
		})
		valid = e == nil && ok
	}
	if !valid {
		consumed := s.consumeBackupCode(userID, code)
		if !consumed {
			return ErrInvalidCreds // Nest maps this to 401 'Invalid 2FA code'
		}
	}
	s.db.Model(&MfaMethod{}).
		Where(map[string]any{"userId": userID, "methodType": "TOTP"}).
		Updates(map[string]any{"isActive": true, "isVerified": true})
	s.db.Model(&User{}).Where(map[string]any{"id": userID}).Update("mfaEnabled", true)
	if sessionID != "" && s.rdb != nil { // mirrors TokenStorage.storeSessionMfaVerified
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()
		s.rdb.Set(ctx, "mfaverified:"+sessionID, "1", 7*24*time.Hour)
	}
	return nil
}

// resolveSecret reads the newest TOTP method whether or not it is active yet —
// the first verify happens while the method is still unverified, so filtering
// on isActive alone makes enablement impossible (the twin has this bug).
func (s *Service) resolveSecret(userID string) string {
	var m MfaMethod
	err := s.db.Where(map[string]any{"userId": userID, "methodType": "TOTP"}).
		Order(`"createdAt" DESC`).First(&m).Error
	if err == nil && m.Secret != nil {
		return *m.Secret
	}
	var u User
	if s.db.Select(`"mfaSecret"`).First(&u, map[string]any{"id": userID}).Error == nil {
		return legacySecret(u.ID)
	}
	return ""
}

func (s *Service) consumeBackupCode(userID, code string) bool {
	var rows []BackupCode
	s.db.Where(map[string]any{"userId": userID, "isUsed": false}).Find(&rows)
	for _, r := range rows {
		if strings.HasPrefix(r.Code, "$argon2") { // hashed variant, if migrated later
			if VerifyPassword(r.Code, code) == nil {
				s.db.Model(&BackupCode{}).Where(map[string]any{"id": r.ID}).Update("isUsed", true)
				return true
			}
			continue
		}
		if subtle.ConstantTimeCompare([]byte(r.Code), []byte(code)) == 1 {
			s.db.Model(&BackupCode{}).Where(map[string]any{"id": r.ID}).Update("isUsed", true)
			return true
		}
	}
	return false
}

func normalizeCode(s string) string {
	s = strings.ToUpper(strings.TrimSpace(s))
	return strings.ReplaceAll(s, "-", "")
}

func legacySecret(string) string { return "" } // ponytail: no pre-MFAMethod accounts exist yet

func urlEscape(s string) string {
	r := strings.NewReplacer(":", "%3A", "@", "%40", " ", "%20")
	return r.Replace(s)
}

func shaShort(s string) string {
	h := sha256.Sum256([]byte(s))
	return hex.EncodeToString(h[:16])
}

package auth

import "time"

type User struct {
	ID            string    `gorm:"column:id"`
	Email         string    `gorm:"column:email"`
	Password      *string   `gorm:"column:password"`
	FullName      *string   `gorm:"column:fullName"`
	Phone         *string   `gorm:"column:phone"`
	Avatar        *string   `gorm:"column:avatar"`
	Role          string    `gorm:"column:role"`
	EmailVerified bool      `gorm:"column:emailVerified"`
	PhoneVerified bool      `gorm:"column:phoneVerified"`
	MfaEnabled    bool      `gorm:"column:mfaEnabled"`
	CreatedAt     time.Time `gorm:"column:createdAt"`
	UpdatedAt     time.Time `gorm:"column:updatedAt"`
}

func (User) TableName() string { return "users" }

type Session struct {
	ID           string     `gorm:"column:id"`
	Token        string     `gorm:"column:token"`
	RefreshToken *string    `gorm:"column:refreshToken"`
	UserID       string     `gorm:"column:userId"`
	DeviceID     *string    `gorm:"column:deviceId"`
	IPAddress    *string    `gorm:"column:ipAddress"`
	UserAgent    *string    `gorm:"column:userAgent"`
	Status       string     `gorm:"column:status"`
	ExpiresAt    time.Time  `gorm:"column:expiresAt"`
	RevokedAt    *time.Time `gorm:"column:revokedAt"`
	CreatedAt    time.Time  `gorm:"column:createdAt"`
	UpdatedAt    time.Time  `gorm:"column:updatedAt"`
}

func (Session) TableName() string { return "sessions" }

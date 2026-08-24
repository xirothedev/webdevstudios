package auth

import "time"

type RegisterInput struct {
	Email    string  `json:"email" binding:"required,email"`
	Password string  `json:"password" binding:"required,min=8"`
	FullName string  `json:"fullName" binding:"required"`
	Phone    *string `json:"phone"`
}

type LoginInput struct {
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required"`
	RememberMe bool   `json:"rememberMe"`
}

type UserBriefDTO struct {
	ID            string  `json:"id"`
	Email         string  `json:"email"`
	FullName      *string `json:"fullName"`
	EmailVerified bool    `json:"emailVerified"`
	MfaEnabled    bool    `json:"mfaEnabled"`
}

type MeDTO struct {
	ID            string    `json:"id"`
	Email         string    `json:"email"`
	FullName      *string   `json:"fullName"`
	Phone         *string   `json:"phone"`
	Avatar        *string   `json:"avatar"`
	Role          string    `json:"role"`
	EmailVerified bool      `json:"emailVerified"`
	MfaEnabled    bool      `json:"mfaEnabled"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type RegisterResponse struct {
	UserID string `json:"userId"`
}

type LoginResponse struct {
	AccessToken  string       `json:"accessToken"`
	RefreshToken string       `json:"refreshToken"`
	TTLSeconds   int          `json:"ttlSeconds,omitempty"`
	User         UserBriefDTO `json:"user"`
	Requires2FA  bool         `json:"requires2FA,omitempty"`
}

type RefreshResponse struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	TTLSeconds   int    `json:"ttlSeconds"`
}

type SuccessResponse struct {
	Success bool `json:"success"`
}

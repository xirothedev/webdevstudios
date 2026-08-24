package reviews

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/cart"
	"github.com/xirothedev/webdevstudios/apps/api-go/internal/products"
)

func newReviewID() string {
	b := make([]byte, 12)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

type HTTPError = cart.HTTPError

func bad(code int, format string, args ...any) *HTTPError {
	return &HTTPError{Code: code, Msg: fmt.Sprintf(format, args...)}
}

var validSlugs = map[string]bool{"AO_THUN": true, "PAD_CHUOT": true, "DAY_DEO": true, "MOC_KHOA": true}

type Review struct {
	ID        string    `gorm:"column:id"`
	Rating    int       `gorm:"column:rating"`
	Comment   *string   `gorm:"column:comment"`
	UserID    string    `gorm:"column:userId"`
	ProductID string    `gorm:"column:productId"`
	CreatedAt time.Time `gorm:"column:createdAt"`
	UpdatedAt time.Time `gorm:"column:updatedAt"`

	User    ReviewUser       `gorm:"foreignKey:UserID;references:ID"`
	Product products.Product `gorm:"foreignKey:ProductID;references:ID"`
}

func (Review) TableName() string { return "reviews" }

type ReviewUser struct {
	ID       string  `gorm:"column:id"`
	FullName *string `gorm:"column:fullName"`
	Avatar   *string `gorm:"column:avatar"`
}

func (ReviewUser) TableName() string { return "users" }

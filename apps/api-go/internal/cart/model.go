package cart

import (
	"crypto/rand"
	"encoding/hex"
	"time"

	"gorm.io/gorm"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/products"
)

var errNotFound = gorm.ErrRecordNotFound

func newID() string {
	b := make([]byte, 12)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b) // ponytail: cuid-ish unique id; exact Prisma format not required for FKs
}

func gormExpr(expr string, args ...any) any {
	return gorm.Expr(expr, args...)
}

// Prisma's Cart model has no createdAt column — only id, userId, updatedAt.
type Cart struct {
	ID        string    `gorm:"column:id"`
	UserID    string    `gorm:"column:userId"`
	UpdatedAt time.Time `gorm:"column:updatedAt"`
}

func (Cart) TableName() string { return "carts" }

type CartItem struct {
	ID        string           `gorm:"column:id"`
	CartID    string           `gorm:"column:cartId"`
	ProductID string           `gorm:"column:productId"`
	Size      *string          `gorm:"column:size"`
	Quantity  int              `gorm:"column:quantity"`
	Product   products.Product `gorm:"foreignKey:ProductID;references:ID"`
}

func (CartItem) TableName() string { return "cart_items" }

type CartItemDTO struct {
	ID             string  `json:"id"`
	ProductID      string  `json:"productId"`
	ProductName    string  `json:"productName"`
	ProductSlug    string  `json:"productSlug"`
	ProductPrice   float64 `json:"productPrice"`
	ProductImage   string  `json:"productImage"`
	Size           *string `json:"size"`
	Quantity       int     `json:"quantity"`
	Subtotal       float64 `json:"subtotal"`
	StockAvailable int     `json:"stockAvailable"`
}

type CartDTO struct {
	ID          string        `json:"id"`
	Items       []CartItemDTO `json:"items"`
	TotalItems  int           `json:"totalItems"`
	TotalAmount float64       `json:"totalAmount"`
	UpdatedAt   time.Time     `json:"updatedAt"`
}

package orders

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"gorm.io/gorm"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/products"
)

type Decimal = products.Decimal

type ShippingAddress struct {
	ID           string  `gorm:"column:id"`
	FullName     string  `gorm:"column:fullName"`
	Phone        string  `gorm:"column:phone"`
	AddressLine1 string  `gorm:"column:addressLine1"`
	AddressLine2 *string `gorm:"column:addressLine2"`
	City         string  `gorm:"column:city"`
	District     string  `gorm:"column:district"`
	Ward         string  `gorm:"column:ward"`
	PostalCode   string  `gorm:"column:postalCode"`
	// Prisma's @updatedAt is client-side; columns are NOT NULL without defaults,
	// so GORM must write them (it auto-fills CreatedAt/UpdatedAt by name).
	CreatedAt time.Time `gorm:"column:createdAt"`
	UpdatedAt time.Time `gorm:"column:updatedAt"`
}

func (ShippingAddress) TableName() string { return "shipping_addresses" }

type Order struct {
	ID                string    `gorm:"column:id"`
	UserID            string    `gorm:"column:userId"`
	Code              string    `gorm:"column:code"`
	Status            string    `gorm:"column:status"`
	PaymentStatus     string    `gorm:"column:paymentStatus"`
	TotalAmount       Decimal   `gorm:"column:totalAmount"`
	ShippingFee       Decimal   `gorm:"column:shippingFee"`
	DiscountValue     Decimal   `gorm:"column:discountValue"`
	ShippingAddressID string    `gorm:"column:shippingAddressId"`
	CreatedAt         time.Time `gorm:"column:createdAt"`
	UpdatedAt         time.Time `gorm:"column:updatedAt"`

	ShippingAddress ShippingAddress `gorm:"foreignKey:ShippingAddressID;references:ID"`
	Items           []OrderItem     `gorm:"foreignKey:OrderId;references:ID"`
}

func (Order) TableName() string { return "orders" }

type OrderItem struct {
	ID          string  `gorm:"column:id"`
	OrderId     string  `gorm:"column:orderId"`
	ProductId   *string `gorm:"column:productId"`
	ProductSlug string  `gorm:"column:productSlug"`
	ProductName string  `gorm:"column:productName"`
	Size        *string `gorm:"column:size"`
	Price       Decimal `gorm:"column:price"`
	Quantity    int     `gorm:"column:quantity"`
}

func (OrderItem) TableName() string { return "order_items" }

func newID() string {
	b := make([]byte, 12)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func generateOrderCode(db *gorm.DB) (string, error) {
	for range 10 { // ponytail: random #ORD-NNNN like NestJS; collision retry instead of a sequence table
		b := make([]byte, 2)
		_, _ = rand.Read(b)
		code := fmt.Sprintf("#ORD-%04d", int(b[0])<<8|int(b[1]))
		var count int64
		if err := db.Model(&Order{}).Where(map[string]any{"code": code}).Count(&count).Error; err != nil {
			return "", err
		}
		if count == 0 {
			return code, nil
		}
	}
	return "", fmt.Errorf("could not generate unique order code")
}

// StockItem is one product/size line to reserve or release.
type StockItem struct {
	ProductID string
	Size      *string
	Quantity  int
}

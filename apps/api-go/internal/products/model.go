package products

import (
	"fmt"
	"strconv"
	"time"
)

type Decimal float64

// ponytail: Postgres money/numeric arrives as locale-formatted strings; strip to digits and parse. Swap for shopspring/decimal if precision ever matters.
func (d *Decimal) Scan(src any) error {
	switch v := src.(type) {
	case nil:
		return nil
	case float64:
		*d = Decimal(v)
		return nil
	case int64:
		*d = Decimal(v)
		return nil
	case []byte:
		return d.parse(string(v))
	case string:
		return d.parse(v)
	default:
		return fmt.Errorf("products: cannot scan %T into Decimal", src)
	}
}

func (d *Decimal) parse(s string) error {
	clean := make([]rune, 0, len(s))
	for _, r := range s {
		if (r >= '0' && r <= '9') || r == '.' || r == '-' {
			clean = append(clean, r)
		}
	}
	f, err := strconv.ParseFloat(string(clean), 64)
	if err != nil {
		return fmt.Errorf("products: bad decimal %q: %w", s, err)
	}
	*d = Decimal(f)
	return nil
}

// Prisma writes camelCase column names (no @map in schema), so every tag is explicit.
type Product struct {
	ID            string      `gorm:"column:id"`
	Slug          string      `gorm:"column:slug"`
	Name          string      `gorm:"column:name"`
	Description   string      `gorm:"column:description"`
	PriceCurrent  Decimal     `gorm:"column:priceCurrent"`
	PriceOriginal *Decimal    `gorm:"column:priceOriginal"`
	PriceDiscount *Decimal    `gorm:"column:priceDiscount"`
	Stock         int         `gorm:"column:stock"`
	HasSizes      bool        `gorm:"column:hasSizes"`
	Badge         *string     `gorm:"column:badge"`
	RatingValue   Decimal     `gorm:"column:ratingValue"`
	RatingCount   int         `gorm:"column:ratingCount"`
	IsPublished   bool        `gorm:"column:isPublished"`
	CreatedAt     time.Time   `gorm:"column:createdAt"`
	UpdatedAt     time.Time   `gorm:"column:updatedAt"`
	SizeStocks    []SizeStock `gorm:"foreignKey:ProductID;references:ID"`
}

func (Product) TableName() string { return "products" }

type SizeStock struct {
	ID        string `gorm:"column:id"`
	Size      string `gorm:"column:size"`
	Stock     int    `gorm:"column:stock"`
	ProductID string `gorm:"column:productId"`
}

func (SizeStock) TableName() string { return "product_size_stocks" }

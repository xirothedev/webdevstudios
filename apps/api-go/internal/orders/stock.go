package orders

import (
	"errors"
	"fmt"

	"gorm.io/gorm"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/products"
)

// stockOf returns available stock for product (or product+size); ok=false means
// the size row does not exist — same null semantics as cart.availableStock.
func stockOf(db *gorm.DB, productID string, size *string) (int, bool) {
	var p products.Product
	if err := db.Preload("SizeStocks").First(&p, map[string]any{"id": productID}).Error; err != nil {
		return 0, false
	}
	if !p.HasSizes {
		return p.Stock, true
	}
	if size == nil {
		return 0, false
	}
	for _, ss := range p.SizeStocks {
		if ss.Size == *size {
			return ss.Stock, true
		}
	}
	return 0, false
}

func productInfo(db *gorm.DB, productID string) (string, float64, error) {
	var p products.Product
	err := db.First(&p, map[string]any{"id": productID}).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return "", 0, bad(404, "Product with id %s not found", productID)
	}
	if err != nil {
		return "", 0, err
	}
	return p.Name, float64(p.PriceCurrent), nil
}

// reserve decrements conditionally: the WHERE stock >= qty clause is what makes
// oversell impossible under concurrency. Sized products update both the size row
// and the product total, keeping Prisma's denormalized total in sync.
func reserve(tx *gorm.DB, items []StockItem) error {
	for _, it := range items {
		if it.Size == nil {
			res := tx.Model(&products.Product{}).
				Where(map[string]any{"id": it.ProductID}).
				Where("stock >= ?", it.Quantity).
				UpdateColumn("stock", gorm.Expr("stock - ?", it.Quantity))
			if res.Error != nil {
				return res.Error
			}
			if res.RowsAffected == 0 {
				return bad(409, "Insufficient stock for product %s", it.ProductID)
			}
			continue
		}
		res := tx.Model(&products.SizeStock{}).
			Where(map[string]any{"productId": it.ProductID, "size": *it.Size}).
			Where("stock >= ?", it.Quantity).
			UpdateColumn("stock", gorm.Expr("stock - ?", it.Quantity))
		if res.Error != nil {
			return res.Error
		}
		if res.RowsAffected == 0 {
			return bad(409, "Insufficient stock for size %s of product %s", *it.Size, it.ProductID)
		}
		if err := tx.Model(&products.Product{}).
			Where(map[string]any{"id": it.ProductID}).
			UpdateColumn("stock", gorm.Expr("stock - ?", it.Quantity)).Error; err != nil {
			return err
		}
	}
	return nil
}

// release is the exact inverse, used by cancel and expire.
func release(tx *gorm.DB, items []StockItem) error {
	for _, it := range items {
		if it.Size == nil {
			if err := tx.Model(&products.Product{}).
				Where(map[string]any{"id": it.ProductID}).
				UpdateColumn("stock", gorm.Expr("stock + ?", it.Quantity)).Error; err != nil {
				return err
			}
			continue
		}
		if err := tx.Model(&products.SizeStock{}).
			Where(map[string]any{"productId": it.ProductID, "size": *it.Size}).
			UpdateColumn("stock", gorm.Expr("stock + ?", it.Quantity)).Error; err != nil {
			return err
		}
		if err := tx.Model(&products.Product{}).
			Where(map[string]any{"id": it.ProductID}).
			UpdateColumn("stock", gorm.Expr("stock + ?", it.Quantity)).Error; err != nil {
			return err
		}
	}
	return nil
}

func sizeSuffix(size *string) string {
	if size == nil {
		return ""
	}
	return fmt.Sprintf(" (%s)", *size)
}

func max0(n int) int {
	if n < 0 {
		return 0
	}
	return n
}

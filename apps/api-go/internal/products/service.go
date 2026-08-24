package products

import (
	"errors"
	"fmt"

	"gorm.io/gorm"
)

var (
	ErrNotFound     = errors.New("product not found")
	ErrSizeNotFound = errors.New("size not found")

	validSlugs = map[string]bool{"AO_THUN": true, "PAD_CHUOT": true, "DAY_DEO": true, "MOC_KHOA": true}
)

type Service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) List() ([]Product, error) {
	var rows []Product
	err := s.db.Preload("SizeStocks").Where(map[string]any{"isPublished": true}).Find(&rows).Error
	return rows, err
}

func (s *Service) BySlug(slug string) (*Product, error) {
	if !validSlugs[slug] {
		return nil, ErrNotFound
	}
	var row Product
	err := s.db.Preload("SizeStocks").Where("slug = ?", slug).First(&row).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("products: query slug %s: %w", slug, err)
	}
	return &row, nil
}

func (s *Service) Stock(slug, size string) (*StockInfoDTO, error) {
	p, err := s.BySlug(slug)
	if err != nil {
		return nil, err
	}
	sizes := mapSizes(p.SizeStocks)
	if !p.HasSizes {
		return &StockInfoDTO{Stock: p.Stock, StockStatus: statusOf(p.Stock)}, nil
	}
	if size != "" {
		for _, ss := range sizes {
			if ss.Size == size {
				return &StockInfoDTO{Stock: ss.Stock, StockStatus: statusOf(ss.Stock), SizeStocks: sizes}, nil
			}
		}
		return nil, ErrSizeNotFound
	}
	total := 0
	for _, ss := range sizes {
		total += ss.Stock
	}
	return &StockInfoDTO{Stock: total, StockStatus: statusOf(total), SizeStocks: sizes}, nil
}

func toDTO(p Product) ProductDTO {
	status := statusOf(p.Stock)
	if p.HasSizes && len(p.SizeStocks) > 0 {
		total := 0
		for _, ss := range p.SizeStocks {
			total += ss.Stock
		}
		status = statusOf(total)
	}
	return ProductDTO{
		ID:            p.ID,
		Slug:          p.Slug,
		Name:          p.Name,
		Description:   p.Description,
		PriceCurrent:  float64(p.PriceCurrent),
		PriceOriginal: decPtr(p.PriceOriginal),
		PriceDiscount: decPtr(p.PriceDiscount),
		Stock:         p.Stock,
		HasSizes:      p.HasSizes,
		Badge:         p.Badge,
		RatingValue:   float64(p.RatingValue),
		RatingCount:   p.RatingCount,
		SizeStocks:    mapSizes(p.SizeStocks),
		StockStatus:   status,
		IsPublished:   p.IsPublished,
		CreatedAt:     p.CreatedAt,
		UpdatedAt:     p.UpdatedAt,
	}
}

func mapSizes(rows []SizeStock) []SizeStockDTO {
	out := make([]SizeStockDTO, 0, len(rows))
	for _, r := range rows {
		out = append(out, SizeStockDTO{Size: r.Size, Stock: r.Stock})
	}
	return out
}

func decPtr(d *Decimal) *float64 {
	if d == nil {
		return nil
	}
	f := float64(*d)
	return &f
}

func statusOf(stock int) string {
	switch {
	case stock == 0:
		return "out_of_stock"
	case stock < 5:
		return "low_stock"
	default:
		return "in_stock"
	}
}

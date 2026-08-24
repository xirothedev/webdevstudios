package products

import "time"

type SizeStockDTO struct {
	Size  string `json:"size"`
	Stock int    `json:"stock"`
}

type ProductDTO struct {
	ID            string         `json:"id"`
	Slug          string         `json:"slug"`
	Name          string         `json:"name"`
	Description   string         `json:"description"`
	PriceCurrent  float64        `json:"priceCurrent"`
	PriceOriginal *float64       `json:"priceOriginal"`
	PriceDiscount *float64       `json:"priceDiscount"`
	Stock         int            `json:"stock"`
	HasSizes      bool           `json:"hasSizes"`
	Badge         *string        `json:"badge"`
	RatingValue   float64        `json:"ratingValue"`
	RatingCount   int            `json:"ratingCount"`
	SizeStocks    []SizeStockDTO `json:"sizeStocks"`
	StockStatus   string         `json:"stockStatus"`
	IsPublished   bool           `json:"isPublished"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
}

type ProductListDTO struct {
	Products []ProductDTO `json:"products"`
	Total    int          `json:"total"`
}

type StockInfoDTO struct {
	Stock       int            `json:"stock"`
	StockStatus string         `json:"stockStatus"`
	SizeStocks  []SizeStockDTO `json:"sizeStocks"`
}

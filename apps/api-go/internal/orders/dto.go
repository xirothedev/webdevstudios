package orders

import "time"

type ShippingAddressInput struct {
	FullName     string  `json:"fullName" binding:"required,max=100"`
	Phone        string  `json:"phone" binding:"required"`
	AddressLine1 string  `json:"addressLine1" binding:"required,max=200"`
	AddressLine2 *string `json:"addressLine2"`
	City         string  `json:"city" binding:"required,max=100"`
	District     string  `json:"district" binding:"required,max=100"`
	Ward         string  `json:"ward" binding:"required,max=100"`
	PostalCode   string  `json:"postalCode" binding:"required"`
}

type CreateOrderInput struct {
	ShippingAddress ShippingAddressInput `json:"shippingAddress" binding:"required"`
	OrderType       string               `json:"orderType" binding:"required,oneof=FROM_CART DIRECT_PURCHASE"`
	ProductID       *string              `json:"productId"`
	ProductSlug     *string              `json:"productSlug"`
	Size            *string              `json:"size"`
	Quantity        *int                 `json:"quantity"`
}

type OrderItemDTO struct {
	ID          string  `json:"id"`
	ProductID   *string `json:"productId"`
	ProductSlug string  `json:"productSlug"`
	ProductName string  `json:"productName"`
	Size        *string `json:"size"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
	Subtotal    float64 `json:"subtotal"`
}

type OrderDTO struct {
	ID              string             `json:"id"`
	Code            string             `json:"code"`
	Status          string             `json:"status"`
	PaymentStatus   string             `json:"paymentStatus"`
	TotalAmount     float64            `json:"totalAmount"`
	ShippingFee     float64            `json:"shippingFee"`
	DiscountValue   float64            `json:"discountValue"`
	ShippingAddress ShippingAddressDTO `json:"shippingAddress"`
	Items           []OrderItemDTO     `json:"items"`
	CreatedAt       time.Time          `json:"createdAt"`
	UpdatedAt       time.Time          `json:"updatedAt"`
}

type ShippingAddressDTO struct {
	FullName     string  `json:"fullName"`
	Phone        string  `json:"phone"`
	AddressLine1 string  `json:"addressLine1"`
	AddressLine2 *string `json:"addressLine2"`
	City         string  `json:"city"`
	District     string  `json:"district"`
	Ward         string  `json:"ward"`
	PostalCode   string  `json:"postalCode"`
}

type OrderListDTO struct {
	Orders []OrderDTO `json:"orders"`
	Total  int64      `json:"total"`
}

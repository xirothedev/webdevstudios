package orders

import (
	"errors"
	"fmt"
	"log"
	"time"

	"gorm.io/gorm"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/cart"
)

type HTTPError = cart.HTTPError

func bad(code int, format string, args ...any) *HTTPError {
	return &HTTPError{Code: code, Msg: fmt.Sprintf(format, args...)}
}

var errNotClaimed = errors.New("order claim lost")

// ponytail: mirrors apps/web/src/lib/shipping.ts — keep in sync
const (
	freeShippingThreshold = 500000
	shippingFeeAmount     = 30000
)

type Service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) *Service { return &Service{db: db} }

func (s *Service) Create(userID string, in CreateOrderInput) (*OrderDTO, error) {
	var pending int64
	if err := s.db.Model(&Order{}).Where(map[string]any{"userId": userID, "status": "PENDING", "paymentStatus": "PENDING"}).Count(&pending).Error; err != nil {
		return nil, err
	}
	if pending > 0 {
		var first Order
		s.db.Where(map[string]any{"userId": userID, "status": "PENDING", "paymentStatus": "PENDING"}).First(&first)
		return nil, bad(409, "You have a pending order. Please complete or cancel it before creating a new one. Order ID: %s", first.ID)
	}

	var items []StockItem
	var orderItems []OrderItem
	var total float64

	switch in.OrderType {
	case "FROM_CART":
		cartSvc := cart.NewService(s.db)
		cartDTO, err := cartSvc.GetCart(userID)
		if err != nil {
			return nil, err
		}
		if len(cartDTO.Items) == 0 {
			return nil, bad(400, "Cart is empty")
		}
		for _, ci := range cartDTO.Items {
			pid := ci.ProductID
			sz := ci.Size
			available, ok := stockOf(s.db, pid, sz)
			if !ok || available < ci.Quantity {
				return nil, bad(409, "Insufficient stock for %s%s. Available: %d, Requested: %d", ci.ProductName, sizeSuffix(sz), max0(available), ci.Quantity)
			}
			total += ci.ProductPrice * float64(ci.Quantity)
			orderItems = append(orderItems, OrderItem{
				ID: newID(), ProductId: &pid, ProductSlug: ci.ProductSlug,
				ProductName: ci.ProductName, Size: sz, Price: Decimal(ci.ProductPrice), Quantity: ci.Quantity,
			})
			items = append(items, StockItem{ProductID: pid, Size: sz, Quantity: ci.Quantity})
		}
	case "DIRECT_PURCHASE":
		if in.ProductID == nil || in.ProductSlug == nil || in.Quantity == nil || *in.Quantity <= 0 {
			return nil, bad(400, "productId, productSlug and quantity are required for direct purchase")
		}
		pid, sz, qty := *in.ProductID, in.Size, *in.Quantity
		name, price, err := productInfo(s.db, pid)
		if err != nil {
			return nil, err
		}
		available, ok := stockOf(s.db, pid, sz)
		if !ok || available < qty {
			return nil, bad(409, "Insufficient stock for %s%s. Available: %d, Requested: %d", name, sizeSuffix(sz), max0(available), qty)
		}
		total = price * float64(qty)
		slug := *in.ProductSlug
		orderItems = append(orderItems, OrderItem{
			ID: newID(), ProductId: &pid, ProductSlug: slug,
			ProductName: name, Size: sz, Price: Decimal(price), Quantity: qty,
		})
		items = append(items, StockItem{ProductID: pid, Size: sz, Quantity: qty})
	default:
		return nil, bad(400, "Invalid order type: %s", in.OrderType)
	}

	shippingFee := float64(shippingFeeAmount)
	if total >= freeShippingThreshold {
		shippingFee = 0 // free if total >= 500k
	}
	discount := 0.0 // vouchers arrive later
	finalAmount := total + shippingFee - discount

	code, err := generateOrderCode(s.db)
	if err != nil {
		return nil, err
	}

	addr := ShippingAddress{
		ID: newID(), FullName: in.ShippingAddress.FullName, Phone: in.ShippingAddress.Phone,
		AddressLine1: in.ShippingAddress.AddressLine1, AddressLine2: in.ShippingAddress.AddressLine2,
		City: in.ShippingAddress.City, District: in.ShippingAddress.District,
		Ward: in.ShippingAddress.Ward, PostalCode: in.ShippingAddress.PostalCode,
	}
	order := Order{
		ID: newID(), UserID: userID, Code: code,
		Status: "PENDING", PaymentStatus: "PENDING",
		TotalAmount: Decimal(finalAmount), ShippingFee: Decimal(shippingFee), DiscountValue: Decimal(discount),
		ShippingAddressID: addr.ID,
	}

	err = s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&addr).Error; err != nil {
			return err
		}
		if err := tx.Create(&order).Error; err != nil {
			return err
		}
		for i := range orderItems {
			orderItems[i].OrderId = order.ID
			if err := tx.Create(&orderItems[i]).Error; err != nil {
				return err
			}
		}
		return reserve(tx, items) // conditional updates guard against oversell races
	})
	if err != nil {
		return nil, err
	}

	if in.OrderType == "FROM_CART" {
		cartSvc := cart.NewService(s.db)
		if _, err := cartSvc.ClearCart(userID); err != nil {
			log.Printf("orders: order %s created but cart clear failed: %v", order.ID, err)
		}
	}
	created, err := s.byID(order.ID)
	if err != nil {
		return nil, err
	}
	return toDTO(created), nil
}

func (s *Service) List(userID string, page, limit int, status string) (*OrderListDTO, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	where := map[string]any{"userId": userID}
	if status != "" {
		where["status"] = status
	}
	var total int64
	if err := s.db.Model(&Order{}).Where(where).Count(&total).Error; err != nil {
		return nil, err
	}
	var rows []Order
	if err := s.db.Preload("ShippingAddress").Preload("Items").
		Where(where).Order(`"createdAt" DESC`).
		Offset((page - 1) * limit).Limit(limit).Find(&rows).Error; err != nil {
		return nil, err
	}
	dto := &OrderListDTO{Total: total}
	for i := range rows {
		dto.Orders = append(dto.Orders, *toDTO(&rows[i]))
	}
	return dto, nil
}

func (s *Service) Get(orderID, userID, role string) (*OrderDTO, error) {
	order, err := s.byID(orderID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, bad(404, "Order with id %s not found", orderID)
	}
	if err != nil {
		return nil, err
	}
	if order.UserID != userID && role != "ADMIN" {
		return nil, bad(403, "Order does not belong to user")
	}
	return toDTO(order), nil
}

func (s *Service) Cancel(orderID, userID string) (*OrderDTO, error) {
	order, err := s.byID(orderID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, bad(404, "Order with id %s not found", orderID)
	}
	if err != nil {
		return nil, err
	}
	if order.UserID != userID {
		return nil, bad(403, "Order does not belong to user")
	}
	if order.Status != "PENDING" {
		return nil, bad(400, "Cannot cancel order with status %s. Only PENDING orders can be cancelled.", order.Status)
	}
	items := stockItems(order.Items)
	err = s.db.Transaction(func(tx *gorm.DB) error {
		// NestJS cancelPending writes ONLY status; paymentStatus stays untouched
		claimed := tx.Model(&Order{}).Where(map[string]any{"id": orderID, "status": "PENDING"}).
			Update("status", "CANCELLED")
		if claimed.Error != nil {
			return claimed.Error
		}
		if claimed.RowsAffected == 0 {
			return errNotClaimed // lost a concurrent cancel/expire race — stock untouched
		}
		return release(tx, items)
	})
	if errors.Is(err, errNotClaimed) {
		return nil, bad(400, "Cannot cancel order with status PENDING. Only PENDING orders can be cancelled.")
	}
	if err != nil {
		return nil, err
	}
	fresh, err := s.byID(orderID)
	if err != nil {
		return nil, err
	}
	return toDTO(fresh), nil
}

// ExpirePending mirrors the NestJS 15-minute cron sweep for one order.
func (s *Service) ExpirePending(orderID string) bool {
	order, err := s.byID(orderID)
	if err != nil || order.Status != "PENDING" || order.PaymentStatus != "PENDING" {
		return false
	}
	err = s.db.Transaction(func(tx *gorm.DB) error {
		claimed := tx.Model(&Order{}).Where(map[string]any{"id": orderID, "status": "PENDING", "paymentStatus": "PENDING"}).
			Updates(map[string]any{"status": "CANCELLED", "paymentStatus": "FAILED"})
		if claimed.Error != nil {
			return claimed.Error
		}
		if claimed.RowsAffected == 0 {
			return errNotClaimed
		}
		return release(tx, stockItems(order.Items))
	})
	if err != nil {
		log.Printf("orders: expire %s failed: %v", orderID, err)
		return false
	}
	log.Printf("orders: expired %s (%s), stock restored", orderID, order.Code)
	return true
}

// SweepExpired handles all PENDING+PENDING orders older than 15 minutes.
func (s *Service) SweepExpired() int {
	cutoff := time.Now().Add(-15 * time.Minute)
	var ids []string
	if err := s.db.Model(&Order{}).Where(map[string]any{"status": "PENDING", "paymentStatus": "PENDING"}).
		Where("createdAt < ?", cutoff).Pluck("id", &ids).Error; err != nil {
		return 0
	}
	n := 0
	for _, id := range ids {
		if s.ExpirePending(id) {
			n++
		}
	}
	return n
}

func (s *Service) byID(id string) (*Order, error) {
	var o Order
	err := s.db.Preload("ShippingAddress").Preload("Items").First(&o, map[string]any{"id": id}).Error
	return &o, err
}

func toDTO(o *Order) *OrderDTO {
	dto := &OrderDTO{
		ID: o.ID, Code: o.Code, Status: o.Status, PaymentStatus: o.PaymentStatus,
		TotalAmount: float64(o.TotalAmount), ShippingFee: float64(o.ShippingFee), DiscountValue: float64(o.DiscountValue),
		CreatedAt: o.CreatedAt, UpdatedAt: o.UpdatedAt,
		Items: make([]OrderItemDTO, 0, len(o.Items)),
	}
	a := o.ShippingAddress
	dto.ShippingAddress = ShippingAddressDTO{
		FullName: a.FullName, Phone: a.Phone, AddressLine1: a.AddressLine1,
		AddressLine2: a.AddressLine2, City: a.City, District: a.District, Ward: a.Ward, PostalCode: a.PostalCode,
	}
	for _, it := range o.Items {
		price := float64(it.Price)
		dto.Items = append(dto.Items, OrderItemDTO{
			ID: it.ID, ProductID: it.ProductId, ProductSlug: it.ProductSlug,
			ProductName: it.ProductName, Size: it.Size, Price: price,
			Quantity: it.Quantity, Subtotal: price * float64(it.Quantity),
		})
	}
	return dto
}

func stockItems(items []OrderItem) []StockItem {
	out := make([]StockItem, 0, len(items))
	for _, it := range items {
		if it.ProductId != nil {
			out = append(out, StockItem{ProductID: *it.ProductId, Size: it.Size, Quantity: it.Quantity})
		}
	}
	return out
}

// ListAll backs GET /orders/admin/all.
func (s *Service) ListAll(page, limit int, status string) (*OrderListDTO, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	where := map[string]any{}
	if status != "" {
		where["status"] = status
	}
	var total int64
	if err := s.db.Model(&Order{}).Where(where).Count(&total).Error; err != nil {
		return nil, err
	}
	var rows []Order
	if err := s.db.Preload("ShippingAddress").Preload("Items").
		Where(where).Order(`"createdAt" DESC`).
		Offset((page - 1) * limit).Limit(limit).Find(&rows).Error; err != nil {
		return nil, err
	}
	dto := &OrderListDTO{Total: total}
	for i := range rows {
		dto.Orders = append(dto.Orders, *toDTO(&rows[i]))
	}
	return dto, nil
}

var validStatuses = map[string]bool{"PENDING": true, "CONFIRMED": true, "PROCESSING": true, "SHIPPING": true, "DELIVERED": true, "CANCELLED": true, "RETURNED": true}

func (s *Service) UpdateStatus(orderID, status string) (*OrderDTO, error) {
	if !validStatuses[status] {
		return nil, bad(400, "status must be one of PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, CANCELLED, RETURNED")
	}
	res := s.db.Model(&Order{}).Where(map[string]any{"id": orderID}).Update("status", status)
	if res.Error != nil {
		return nil, res.Error
	}
	if res.RowsAffected == 0 {
		return nil, bad(404, "Order with id %s not found", orderID)
	}
	o, err := s.byID(orderID)
	if err != nil {
		return nil, err
	}
	return toDTO(o), nil
}

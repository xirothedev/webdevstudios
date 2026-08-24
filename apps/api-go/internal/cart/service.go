package cart

import (
	"errors"
	"fmt"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/products"
)

// HTTPError lets services own the exact status+message parity that NestJS
// exceptions carried, while staying transport-blind.
type HTTPError struct {
	Code int
	Msg  string
}

func (e *HTTPError) Error() string { return e.Msg }

func bad(code int, format string, args ...any) *HTTPError {
	return &HTTPError{Code: code, Msg: fmt.Sprintf(format, args...)}
}

var imageMap = map[string]string{
	"AO_THUN":   "/shop/ao-thun.webp",
	"PAD_CHUOT": "/shop/pad-chuot.webp",
	"DAY_DEO":   "/shop/day-deo.webp",
	"MOC_KHOA":  "/shop/moc-khoa.webp",
}

func productImage(slug string) string {
	if u, ok := imageMap[slug]; ok {
		return u
	}
	return "/shop/default.webp"
}

// availableStock mirrors cart.utils.availableStock: sized products resolve the
// matching size row; missing row = null = "not found" upstream.
func availableStock(p *products.Product, size *string) (int, bool) {
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

func (s *Service) GetCart(userID string) (*CartDTO, error) {
	cart, err := s.findOrCreateCart(userID)
	if err != nil {
		return nil, err
	}
	return s.mapToDTO(cart.ID)
}

func (s *Service) AddToCart(userID, productID string, size *string, quantity int) (*CartDTO, error) {
	if quantity <= 0 {
		return nil, bad(400, "Quantity must be greater than 0")
	}
	var p products.Product
	err := s.db.Preload("SizeStocks").First(&p, map[string]any{"id": productID}).Error
	if errors.Is(err, errNotFound) {
		return nil, bad(404, "Product with id %s not found", productID)
	}
	if err != nil {
		return nil, err
	}
	if p.HasSizes && size == nil {
		return nil, bad(400, "Size is required for products with sizes")
	}
	if !p.HasSizes && size != nil {
		return nil, bad(400, "Size is not supported for this product")
	}
	available, ok := availableStock(&p, size)
	if !ok {
		return nil, bad(404, "Size %s not found for product %s", *size, productID)
	}
	cart, err := s.findOrCreateCart(userID)
	if err != nil {
		return nil, err
	}
	current := 0
	var existing CartItem
	err = s.db.Where(map[string]any{"cartId": cart.ID, "productId": productID, "size": size}).First(&existing).Error
	if err == nil {
		current = existing.Quantity
	} else if !errors.Is(err, errNotFound) {
		return nil, err
	}
	if current+quantity > available {
		return nil, bad(409, "Insufficient stock. Available: %d, Requested: %d", available, current+quantity)
	}
	if existing.ID != "" {
		err = s.db.Model(&CartItem{}).Where(map[string]any{"id": existing.ID}).
			Update("quantity", gormExpr("quantity + ?", quantity)).Error
	} else {
		err = s.db.Create(&CartItem{ID: newID(), CartID: cart.ID, ProductID: productID, Size: size, Quantity: quantity}).Error
	}
	if err != nil {
		return nil, err
	}
	return s.mapToDTO(cart.ID)
}

func (s *Service) UpdateCartItem(userID, itemID string, quantity int) (*CartDTO, error) {
	if quantity <= 0 {
		return nil, bad(400, "Quantity must be greater than 0")
	}
	item, err := s.ownedItem(userID, itemID)
	if err != nil {
		return nil, err
	}
	available, ok := availableStock(&item.Product, item.Size)
	if !ok {
		return nil, bad(404, "Size %s not found for product %s", *item.Size, item.ProductID)
	}
	if quantity > available {
		return nil, bad(409, "Insufficient stock. Available: %d, Requested: %d", available, quantity)
	}
	if err := s.db.Model(&CartItem{}).Where(map[string]any{"id": itemID}).Update("quantity", quantity).Error; err != nil {
		return nil, err
	}
	return s.mapToDTO(item.CartID)
}

func (s *Service) RemoveFromCart(userID, itemID string) (*CartDTO, error) {
	item, err := s.ownedItem(userID, itemID)
	if err != nil {
		return nil, err
	}
	if err := s.db.Delete(&CartItem{}, map[string]any{"id": itemID}).Error; err != nil {
		return nil, err
	}
	return s.mapToDTO(item.CartID)
}

func (s *Service) ClearCart(userID string) (*CartDTO, error) {
	cart, err := s.findOrCreateCart(userID)
	if err != nil {
		return nil, err
	}
	if err := s.db.Delete(&CartItem{}, map[string]any{"cartId": cart.ID}).Error; err != nil {
		return nil, err
	}
	return s.mapToDTO(cart.ID)
}

// ownedItem loads an item with its product, then enforces ownership the same way
// NestJS does: item.cartId must equal the caller's cart id.
func (s *Service) ownedItem(userID, itemID string) (*CartItem, error) {
	var item CartItem
	err := s.db.Preload("Product").Preload("Product.SizeStocks").First(&item, map[string]any{"id": itemID}).Error
	if errors.Is(err, errNotFound) {
		return nil, bad(404, "Cart item with id %s not found", itemID)
	}
	if err != nil {
		return nil, err
	}
	cart, err := s.findOrCreateCart(userID)
	if err != nil {
		return nil, err
	}
	if item.CartID != cart.ID {
		return nil, bad(403, "Cart item does not belong to user")
	}
	return &item, nil
}

func (s *Service) findOrCreateCart(userID string) (*Cart, error) {
	var cart Cart
	err := s.db.Where(map[string]any{"userId": userID}).First(&cart).Error
	if err == nil {
		return &cart, nil
	}
	if !errors.Is(err, errNotFound) {
		return nil, err
	}
	cart = Cart{ID: newID(), UserID: userID}
	if err := s.db.Create(&cart).Error; err != nil {
		return nil, err
	}
	return &cart, nil
}

func (s *Service) mapToDTO(cartID string) (*CartDTO, error) {
	var items []CartItem
	if err := s.db.Preload("Product").Preload("Product.SizeStocks").
		Where(map[string]any{"cartId": cartID}).Find(&items).Error; err != nil {
		return nil, err
	}
	dto := &CartDTO{ID: cartID, Items: make([]CartItemDTO, 0, len(items))}
	for _, it := range items {
		price := float64(it.Product.PriceCurrent)
		stock, _ := availableStock(&it.Product, it.Size)
		dto.Items = append(dto.Items, CartItemDTO{
			ID:             it.ID,
			ProductID:      it.ProductID,
			ProductName:    it.Product.Name,
			ProductSlug:    it.Product.Slug,
			ProductPrice:   price,
			ProductImage:   productImage(it.Product.Slug),
			Size:           it.Size,
			Quantity:       it.Quantity,
			Subtotal:       price * float64(it.Quantity),
			StockAvailable: stock,
		})
		dto.TotalItems += it.Quantity
		dto.TotalAmount += price * float64(it.Quantity)
	}
	var cart Cart
	if err := s.db.First(&cart, map[string]any{"id": cartID}).Error; err != nil {
		return nil, err
	}
	dto.UpdatedAt = cart.UpdatedAt
	return dto, nil
}

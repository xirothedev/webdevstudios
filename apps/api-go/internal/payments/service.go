package payments

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/cart"
	"github.com/xirothedev/webdevstudios/apps/api-go/internal/orders"
	"github.com/xirothedev/webdevstudios/apps/api-go/internal/products"
)

type HTTPError = cart.HTTPError

func bad(code int, format string, args ...any) *HTTPError {
	return &HTTPError{Code: code, Msg: fmt.Sprintf(format, args...)}
}

func newID() string {
	b := make([]byte, 12)
	_, _ = cryptoRead(b)
	return hexEncode(b)
}

type Transaction struct {
	ID              string           `gorm:"column:id"`
	OrderID         string           `gorm:"column:orderId"`
	TransactionCode string           `gorm:"column:transactionCode"`
	Amount          products.Decimal `gorm:"column:amount"`
	Status          string           `gorm:"column:status"`
	PaymentURL      *string          `gorm:"column:paymentUrl"`
	PayosData       *string          `gorm:"column:payosData;->:false;<-:false"` // jsonb; written raw, never selected into scans below
	CreatedAt       time.Time        `gorm:"column:createdAt"`
	UpdatedAt       time.Time        `gorm:"column:updatedAt"`
}

func (Transaction) TableName() string { return "payment_transactions" }

type Service struct {
	db     *gorm.DB
	client *Client
}

func NewService(db *gorm.DB, client *Client) *Service {
	return &Service{db: db, client: client}
}

// CreateLink mirrors payments.service.createPaymentLink including idempotency.
func (s *Service) CreateLink(orderID string) (map[string]string, error) {
	var order orders.Order
	err := s.db.Preload("Items").First(&order, map[string]any{"id": orderID}).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, bad(404, "Order with id %s not found", orderID)
	}
	if err != nil {
		return nil, err
	}
	if order.PaymentStatus == "PAID" {
		return nil, bad(409, "Order is already paid")
	}
	var existing Transaction
	found := s.db.Where(map[string]any{"orderId": order.ID}).First(&existing).Error == nil
	if found {
		if existing.Status == "PENDING" && existing.PaymentURL != nil && *existing.PaymentURL != "" {
			return map[string]string{"paymentUrl": *existing.PaymentURL, "transactionCode": existing.TransactionCode}, nil
		}
		return nil, bad(409, "Payment transaction already exists for this order")
	}
	returnURL := osGetenv("PAYOS_RETURN_URL")
	cancelURL := osGetenv("PAYOS_CANCEL_URL")
	if returnURL == "" || cancelURL == "" {
		return nil, bad(400, "PAYOS_RETURN_URL and PAYOS_CANCEL_URL must be configured")
	}
	items := make([]PaymentItem, 0, len(order.Items))
	for _, it := range order.Items {
		items = append(items, PaymentItem{Name: it.ProductName, Quantity: it.Quantity, Price: float64(it.Price)})
	}
	numStr := strings.ReplaceAll(order.Code, "#", "")
	num, _ := strconv.ParseInt(numStr, 10, 64)
	checkoutURL, txCode, raw, err := s.client.CreatePaymentLink(num, float64(order.TotalAmount), "Thanh toan "+order.Code, returnURL, cancelURL, items)
	if err != nil {
		if errors.Is(err, ErrNotConfigured) {
			return nil, bad(httpStatusNotImplemented, "%v", err)
		}
		return nil, bad(500, "Failed to create payment link: %v", err)
	}
	rawJSON, _ := json.Marshal(raw)
	rawStr := string(rawJSON)
	tx := Transaction{
		ID: newID(), OrderID: order.ID, TransactionCode: txCode,
		Amount: order.TotalAmount, Status: "PENDING",
		PaymentURL: &checkoutURL, PayosData: &rawStr,
	}
	if err := s.db.Create(&tx).Error; err != nil {
		return nil, err
	}
	return map[string]string{"paymentUrl": checkoutURL, "transactionCode": txCode}, nil
}

// ProcessWebhook mirrors processWebhook: signature gate → amount equality gate
// → single conditional settle claim. Returns settled=true only when an order
// actually transitioned.
func (s *Service) ProcessWebhook(envelope map[string]any) (bool, error) {
	if !s.client.VerifyWebhookSignature(envelope) {
		logSecurityEvent("invalid webhook signature")
		return false, bad(400, "Invalid webhook signature")
	}
	data, _ := envelope["data"].(map[string]any)
	success := envelope["success"] == true
	code, _ := data["code"].(string)
	paymentLinkID, _ := data["paymentLinkId"].(string)
	_ = toInt64 // order code matched via transaction row; kept for PayOS parity checks
	amount := toFloat64(data["amount"])

	var tx Transaction
	err := s.db.Where(map[string]any{"transactionCode": paymentLinkID}).First(&tx).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		log.Printf("payments: webhook for unknown paymentLinkId %s — ignoring", paymentLinkID)
		return false, nil
	}
	if err != nil {
		return false, err
	}

	var order orders.Order
	if err := s.db.First(&order, map[string]any{"id": tx.OrderID}).Error; err != nil {
		return false, err
	}
	if amount != float64(order.TotalAmount) {
		// CONTEXT.md invariant: amount mismatch logs to SecurityLog and never settles.
		logSecurityEvent(fmt.Sprintf("webhook amount %v != order total %v for %s", amount, float64(order.TotalAmount), order.Code))
		return false, nil
	}

	claimed := s.db.Model(&orders.Order{}).
		Where(map[string]any{"id": order.ID, "status": "PENDING"}).
		Updates(settleUpdates(success))
	if claimed.Error != nil {
		return false, claimed.Error
	}
	newTxStatus := "FAILED"
	if success && code == "00" && claimed.RowsAffected > 0 {
		newTxStatus = "PAID"
	} else if !success {
		newTxStatus = "CANCELLED"
	}
	s.db.Model(&Transaction{}).Where(map[string]any{"id": tx.ID}).Update("status", newTxStatus)
	return success && claimed.RowsAffected > 0, nil
}

func settleUpdates(success bool) map[string]any {
	if success {
		return map[string]any{"status": "CONFIRMED", "paymentStatus": "PAID"}
	}
	return map[string]any{"status": "CANCELLED", "paymentStatus": "FAILED"}
}

// MarkPaid backs the admin endpoint with the same single-claim discipline.
func (s *Service) MarkPaid(orderID string) error {
	var order orders.Order
	err := s.db.First(&order, map[string]any{"id": orderID}).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return bad(404, "Order with id %s not found", orderID)
	}
	if err != nil {
		return err
	}
	if order.PaymentStatus == "PAID" {
		return bad(409, "Order is already paid")
	}
	res := s.db.Model(&orders.Order{}).
		Where(map[string]any{"id": orderID, "status": "PENDING"}).
		Updates(map[string]any{"status": "CONFIRMED", "paymentStatus": "PAID"})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return bad(409, "Cannot mark paid order with status %s. Only PENDING orders can be marked paid.", order.Status)
	}
	s.db.Model(&Transaction{}).Where(map[string]any{"orderId": orderID}).Update("status", "PAID")
	return nil
}

func logSecurityEvent(msg string) {
	log.Printf("[SECURITY] %s", msg)
	// ponytail: security_logs row insert lands when the admin UI needs it; server log is the sink today
}

func toInt64(v any) int64 {
	switch t := v.(type) {
	case float64:
		return int64(t)
	case string:
		n, _ := strconv.ParseInt(strings.TrimPrefix(t, "#"), 10, 64)
		return n
	default:
		return 0
	}
}

func toFloat64(v any) float64 {
	f, _ := v.(float64)
	return f
}

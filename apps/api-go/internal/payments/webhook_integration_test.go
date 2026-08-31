package payments

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
	"strings"
	"testing"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/xirothedev/webdevstudios/apps/api-go/internal/orders"
	"github.com/xirothedev/webdevstudios/apps/api-go/internal/products"
)

// ponytail: the settle-once and stock invariants live in SQL, so they are only
// trustworthy against a real Postgres. CI provides DATABASE_URL; local runs
// without it are skipped.
func openTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		t.Skip("DATABASE_URL not set — skipping DB integration tests")
	}
	if !strings.Contains(dsn, "sslmode=") {
		dsn += "&sslmode=disable"
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("connect: %v", err)
	}
	if err := db.AutoMigrate(
		&products.Product{},
		&products.SizeStock{},
		&orders.ShippingAddress{},
		&orders.Order{},
		&orders.OrderItem{},
		&Transaction{},
	); err != nil {
		t.Fatalf("automigrate: %v", err)
	}
	return db
}

func sign(data map[string]any) string {
	mac := hmac.New(sha256.New, []byte("testsecret"))
	mac.Write([]byte(BuildCanonicalString(data)))
	return hex.EncodeToString(mac.Sum(nil))
}

func signedEnvelope(success bool, code, paymentLinkID string, amount float64) map[string]any {
	data := map[string]any{
		"accountNumber": "1",
		"amount":        amount,
		"code":          code,
		"currency":      "VND",
		"orderCode":     1,
		"paymentLinkId": paymentLinkID,
	}
	return map[string]any{"data": data, "success": success, "signature": sign(data)}
}

func seedProduct(t *testing.T, db *gorm.DB, id string, stock int, price float64) {
	t.Helper()
	p := products.Product{
		ID: id, Slug: "slug-" + id, Name: "Test product",
		PriceCurrent: products.Decimal(price), Stock: stock,
		HasSizes: false, IsPublished: true,
	}
	if err := db.Create(&p).Error; err != nil {
		t.Fatalf("seed product: %v", err)
	}
}

func stockOf(t *testing.T, db *gorm.DB, productID string) int {
	t.Helper()
	var p products.Product
	if err := db.First(&p, map[string]any{"id": productID}).Error; err != nil {
		t.Fatalf("load product: %v", err)
	}
	return p.Stock
}

func newOrderInput(pid string, qty int) orders.CreateOrderInput {
	slug := "slug-" + pid
	return orders.CreateOrderInput{
		ShippingAddress: orders.ShippingAddressInput{
			FullName: "Tester", Phone: "090", AddressLine1: "1 St",
			City: "HCM", District: "D1", Ward: "W1", PostalCode: "700",
		},
		OrderType:   "DIRECT_PURCHASE",
		ProductID:   &pid,
		ProductSlug: &slug,
		Quantity:    &qty,
	}
}

// createDirectOrder seeds a product, creates a PENDING order via the orders
// service (which reserves stock), and seeds a matching PENDING transaction.
func createDirectOrder(t *testing.T, db *gorm.DB, user, productID string, qty int, price float64) (orderID, txCode string, total float64) {
	t.Helper()
	seedProduct(t, db, productID, 10, price)
	svc := orders.NewService(db)
	dto, err := svc.Create(user, newOrderInput(productID, qty))
	if err != nil {
		t.Fatalf("create order: %v", err)
	}
	total = dto.TotalAmount
	txCode = "PAYLINK-" + productID
	tx := Transaction{
		ID: newID(), OrderID: dto.ID, TransactionCode: txCode,
		Amount: products.Decimal(total), Status: "PENDING",
	}
	if err := db.Create(&tx).Error; err != nil {
		t.Fatalf("seed transaction: %v", err)
	}
	return dto.ID, txCode, total
}

func TestProcessWebhookSettleOnce(t *testing.T) {
	os.Setenv("PAYOS_CHECKSUM_KEY", "testsecret")
	db := openTestDB(t)
	pid := fmt.Sprintf("p-%d", time.Now().UnixNano())
	orderID, txCode, total := createDirectOrder(t, db, fmt.Sprintf("user-%d", time.Now().UnixNano()), pid, 2, 100000)

	paySvc := NewService(db, NewClient())
	settled, err := paySvc.ProcessWebhook(signedEnvelope(true, "00", txCode, total))
	if err != nil {
		t.Fatalf("webhook: %v", err)
	}
	if !settled {
		t.Fatal("expected settled=true")
	}
	var o orders.Order
	if err := db.Preload("Items").First(&o, map[string]any{"id": orderID}).Error; err != nil {
		t.Fatal(err)
	}
	if o.Status != "CONFIRMED" || o.PaymentStatus != "PAID" {
		t.Fatalf("order = %s/%s, want CONFIRMED/PAID", o.Status, o.PaymentStatus)
	}
	if got := stockOf(t, db, *o.Items[0].ProductId); got != 8 {
		t.Fatalf("stock = %d, want 8", got)
	}

	// duplicate webhook loses the claim and must not touch stock again
	settled2, err := paySvc.ProcessWebhook(signedEnvelope(true, "00", txCode, total))
	if err != nil {
		t.Fatalf("duplicate webhook: %v", err)
	}
	if settled2 {
		t.Fatal("expected settled=false for duplicate webhook")
	}
	if got := stockOf(t, db, *o.Items[0].ProductId); got != 8 {
		t.Fatalf("stock after duplicate webhook = %d, want 8", got)
	}
}

func TestProcessWebhookFailedPaymentReleasesStock(t *testing.T) {
	os.Setenv("PAYOS_CHECKSUM_KEY", "testsecret")
	db := openTestDB(t)
	pid := fmt.Sprintf("p-%d", time.Now().UnixNano())
	orderID, txCode, total := createDirectOrder(t, db, fmt.Sprintf("user-%d", time.Now().UnixNano()), pid, 2, 100000)

	paySvc := NewService(db, NewClient())
	settled, err := paySvc.ProcessWebhook(signedEnvelope(false, "99", txCode, total))
	if err != nil {
		t.Fatalf("webhook: %v", err)
	}
	if settled {
		t.Fatal("expected settled=false for failed payment")
	}
	var after orders.Order
	if err := db.First(&after, map[string]any{"id": orderID}).Error; err != nil {
		t.Fatal(err)
	}
	if after.Status != "CANCELLED" || after.PaymentStatus != "FAILED" {
		t.Fatalf("order = %s/%s, want CANCELLED/FAILED", after.Status, after.PaymentStatus)
	}
	if got := stockOf(t, db, pid); got != 10 {
		t.Fatalf("stock after failed payment = %d, want 10 (released)", got)
	}
}

func TestProcessWebhookAmountMismatchNeverSettles(t *testing.T) {
	os.Setenv("PAYOS_CHECKSUM_KEY", "testsecret")
	db := openTestDB(t)
	pid := fmt.Sprintf("p-%d", time.Now().UnixNano())
	orderID, txCode, total := createDirectOrder(t, db, fmt.Sprintf("user-%d", time.Now().UnixNano()), pid, 1, 100000)

	paySvc := NewService(db, NewClient())
	settled, err := paySvc.ProcessWebhook(signedEnvelope(true, "00", txCode, total+1000))
	if err != nil {
		t.Fatalf("webhook: %v", err)
	}
	if settled {
		t.Fatal("expected settled=false on amount mismatch")
	}
	var o orders.Order
	if err := db.First(&o, map[string]any{"id": orderID}).Error; err != nil {
		t.Fatal(err)
	}
	if o.Status != "PENDING" || o.PaymentStatus != "PENDING" {
		t.Fatalf("order = %s/%s, want PENDING/PENDING", o.Status, o.PaymentStatus)
	}
	var txByCode Transaction
	if err := db.First(&txByCode, map[string]any{"transactionCode": txCode}).Error; err != nil {
		t.Fatal(err)
	}
	if txByCode.Status != "PENDING" {
		t.Fatalf("tx status = %s, want PENDING", txByCode.Status)
	}
}

func TestCreateOrderCannotOversell(t *testing.T) {
	db := openTestDB(t)
	pid := fmt.Sprintf("p-%d", time.Now().UnixNano())
	seedProduct(t, db, pid, 1, 100000)
	svc := orders.NewService(db)

	if _, err := svc.Create(fmt.Sprintf("user-a-%d", time.Now().UnixNano()), newOrderInput(pid, 1)); err != nil {
		t.Fatalf("first order: %v", err)
	}
	if got := stockOf(t, db, pid); got != 0 {
		t.Fatalf("stock = %d, want 0", got)
	}
	_, err := svc.Create(fmt.Sprintf("user-b-%d", time.Now().UnixNano()), newOrderInput(pid, 1))
	if err == nil {
		t.Fatal("expected error when stock is exhausted")
	}
	if he, ok := err.(*HTTPError); !ok || he.Code != 409 {
		t.Fatalf("expected 409, got %#v", err)
	}
}

package payments

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"
)

// PayOS REST client — no official Go SDK exists, so this mirrors the @payos/node
// calls against api-merchant.payos.vn directly.

type Client struct {
	clientID    string
	apiKey      string
	checksumKey string
	http        *http.Client
}

func NewClient() *Client {
	c := &Client{
		clientID:    os.Getenv("PAYOS_CLIENT_ID"),
		apiKey:      os.Getenv("PAYOS_API_KEY"),
		checksumKey: os.Getenv("PAYOS_CHECKSUM_KEY"),
		http:        &http.Client{Timeout: 15 * time.Second},
	}
	return c
}

func (c *Client) Enabled() bool { return c != nil && c.clientID != "" }

type PaymentItem struct {
	Name     string  `json:"name"`
	Quantity int     `json:"quantity"`
	Price    float64 `json:"price"`
}

var ErrNotConfigured = errors.New("payments: PAYOS_* env vars not configured")

// CreatePaymentLink mirrors payOS.paymentRequests.create.
func (c *Client) CreatePaymentLink(orderCodeNum int64, amount float64, description string, returnUrl, cancelUrl string, items []PaymentItem) (checkoutURL, paymentLinkID string, raw json.RawMessage, err error) {
	if !c.Enabled() {
		return "", "", nil, ErrNotConfigured
	}
	payload := map[string]any{
		"orderCode":   orderCodeNum,
		"amount":      int64(amount),
		"description": description,
		"returnUrl":   returnUrl,
		"cancelUrl":   cancelUrl,
		"items":       items,
	}
	body, _ := json.Marshal(payload)
	req, _ := http.NewRequest(http.MethodPost, "https://api-merchant.payos.vn/v2/payment-requests", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-client-id", c.clientID)
	req.Header.Set("x-api-key", c.apiKey)
	resp, err := c.http.Do(req)
	if err != nil {
		return "", "", nil, err
	}
	defer resp.Body.Close()
	var out struct {
		Code string          `json:"code"`
		Desc string          `json:"desc"`
		Data json.RawMessage `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return "", "", nil, err
	}
	if out.Code != "00" {
		return "", "", nil, fmt.Errorf("payos: %s %s", out.Code, out.Desc)
	}
	var data struct {
		CheckoutURL   string `json:"checkoutUrl"`
		PaymentLinkID string `json:"paymentLinkId"`
		OrderCode     int64  `json:"orderCode"`
	}
	if err := json.Unmarshal(out.Data, &data); err != nil {
		return "", "", nil, err
	}
	code := data.PaymentLinkID
	if code == "" {
		code = fmt.Sprint(data.OrderCode)
	}
	return data.CheckoutURL, code, out.Data, nil
}

// VerifyWebhookSignature reproduces the PayOS SDK algorithm: sort the `data`
// object's keys alphabetically, join as key=value pairs, HMAC-SHA256 with the
// checksum key, hex-compare to the envelope signature.
func (c *Client) VerifyWebhookSignature(envelope map[string]any) bool {
	if c == nil || c.checksumKey == "" { // verification needs only the checksum key
		return false
	}
	sig, _ := envelope["signature"].(string)
	data, ok := envelope["data"].(map[string]any)
	if sig == "" || !ok {
		return false
	}
	canonical := BuildCanonicalString(data)
	mac := hmac.New(sha256.New, []byte(c.checksumKey))
	mac.Write([]byte(canonical))
	expected := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(sig))
}

// BuildCanonicalString sorts data keys alphabetically and joins key=value pairs.
func BuildCanonicalString(data map[string]any) string {
	keys := make([]string, 0, len(data))
	for k := range data {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	parts := make([]string, 0, len(keys))
	for _, k := range keys {
		parts = append(parts, k+"="+jsonValueString(data[k]))
	}
	return strings.Join(parts, "&")
}

func jsonValueString(v any) string {
	switch t := v.(type) {
	case string:
		return t
	case float64:
		if t == float64(int64(t)) {
			return fmt.Sprintf("%d", int64(t))
		}
		return fmt.Sprintf("%v", t)
	case bool:
		return fmt.Sprintf("%v", t)
	default:
		b, _ := json.Marshal(v)
		return string(b)
	}
}

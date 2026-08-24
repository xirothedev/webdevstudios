package payments

import (
	"encoding/json"
	"os"
	"testing"
)

func TestVerifyWebhookSignature(t *testing.T) {
	os.Setenv("PAYOS_CHECKSUM_KEY", "testsecret")
	c := NewClient()
	raw := `{"code":"00","desc":"success","success":true,"data":{"accountNumber":"1","amount":130000,"code":"00","currency":"VND","description":"pay","desc":"ok","orderCode":29974,"paymentLinkId":"TESTLINK123","reference":"r1","transactionDateTime":"2026-08-24T00:00:00+07:00"},"signature":"e19b5c66d0cfe86a542ecfb0db96cb238d301b914bcaef78bd90d54d0d03fd07"}`
	var env map[string]any
	if err := json.Unmarshal([]byte(raw), &env); err != nil {
		t.Fatal(err)
	}
	if !c.VerifyWebhookSignature(env) {
		data := env["data"].(map[string]any)
		t.Fatalf("mismatch\ncanonical: %q", BuildCanonicalString(data))
	}
}

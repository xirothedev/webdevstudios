#!/bin/bash

# Test PayOS Webhook với ngrok URL
# Usage: ./test-webhook.sh [confirm|test]
#   confirm: Verify webhook URL với PayOS
#   test: Test webhook endpoint với sample payload

NGROK_URL="https://e9d4c4a954c0.ngrok-free.app"
WEBHOOK_URL="${NGROK_URL}/v1/payments/webhook"
API_BASE_URL="${NGROK_URL}/v1"

ACTION=${1:-test}

if [ "$ACTION" = "confirm" ]; then
  echo "Confirming webhook URL with PayOS..."
  echo "Webhook URL: ${WEBHOOK_URL}"
  echo ""
  
  # Gọi endpoint confirm-webhook
  curl -X POST "https://api-merchant.payos.vn/confirm-webhook" \
    -H "Content-Type: application/json" \
    -H "ngrok-skip-browser-warning: true" \
    -d "{\"webhookUrl\": \"${WEBHOOK_URL}\"}" \
    -v
  
  echo ""
  echo "Done! PayOS will send a test webhook to verify the URL."
  exit 0
fi

# Sample webhook payload (cần thay thế bằng payload thực tế từ PayOS)
# Lưu ý: PayOS sẽ tự động thêm signature vào payload
PAYLOAD='{
  "code": "00",
  "desc": "Thành công",
  "success": true,
  "data": {
    "orderCode": 123456789,
    "amount": 897000,
    "description": "Thanh toán đơn hàng #ORD-1234",
    "accountNumber": "970415",
    "reference": "REF123456",
    "transactionDateTime": "2024-12-27T10:00:00Z",
    "currency": "VND",
    "paymentLinkId": "test-payment-link-id",
    "code": "00",
    "desc": "Thành công"
  },
  "signature": "test-signature"
}'

echo "Testing webhook endpoint: ${WEBHOOK_URL}"
echo "Payload:"
echo "${PAYLOAD}" | jq .

echo ""
echo "Sending POST request..."

curl -X POST "${WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d "${PAYLOAD}" \
  -v

echo ""
echo "Done!"


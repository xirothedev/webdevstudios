#!/bin/bash

# Confirm PayOS Webhook URL với ngrok
# Usage: ./confirm-webhook.sh
#   Script sẽ đọc PAYOS_API_KEY và PAYOS_CLIENT_ID từ .env trong cùng thư mục

# Load environment variables from .env file
ENV_FILE="../.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE file not found in current directory!"
  exit 1
fi

# Load .env file (handle values with spaces)
set -a
source "$ENV_FILE"
set +a

NGROK_URL="https://e9d4c4a954c0.ngrok-free.app"
WEBHOOK_URL="${NGROK_URL}/v1/payments/webhook"

# Get credentials from environment
API_KEY=${PAYOS_API_KEY}
CLIENT_ID=${PAYOS_CLIENT_ID}

# Validate credentials
if [ -z "$API_KEY" ] || [ -z "$CLIENT_ID" ]; then
  echo "Error: PAYOS_API_KEY or PAYOS_CLIENT_ID not found in .env"
  echo "Please make sure these variables are set in .env"
  exit 1
fi

echo "Confirming webhook URL with PayOS..."
echo "Webhook URL: ${WEBHOOK_URL}"
echo "Client ID: ${CLIENT_ID:0:10}..." # Show first 10 chars for security
echo ""

# PayOS API endpoint for confirming webhook
PAYOS_API_URL="https://api-merchant.payos.vn/confirm-webhook"

echo "Calling PayOS API: ${PAYOS_API_URL}"
echo ""

# Gọi PayOS API để confirm webhook URL
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${PAYOS_API_URL}" \
  -H "Content-Type: application/json" \
  -H "x-client-id: ${CLIENT_ID}" \
  -H "x-api-key: ${API_KEY}" \
  -d "{\"webhookUrl\": \"${WEBHOOK_URL}\"}")

# Extract HTTP status code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
# Extract response body (all lines except last)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: ${HTTP_CODE}"
echo "Response:"
echo "${BODY}" | jq . 2>/dev/null || echo "${BODY}"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo ""
  echo "✅ Success! Webhook URL confirmed."
  echo "PayOS will send a test webhook to verify the URL."
else
  echo ""
  echo "❌ Failed to confirm webhook URL. HTTP Status: ${HTTP_CODE}"
  exit 1
fi


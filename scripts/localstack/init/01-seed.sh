#!/bin/bash
# Chạy tự động bởi LocalStack khi edge sẵn sàng (init/ready.d).
set -euo pipefail

awslocal s3 mb "s3://webdevstudios" || true
awslocal sqs create-queue --queue-name order-events
awslocal sns create-topic --name order-notifications
awslocal dynamodb create-table \
  --table-name idempotency \
  --attribute-definitions AttributeName=key,AttributeType=S \
  --key-schema AttributeName=key,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
awslocal secretsmanager create-secret \
  --name webdev/local/app \
  --secret-string '{"MAIL_PASS":"fake-resend-key","JWT_SECRET_KEY":"local-dev-only"}'

echo "localstack initialised"

#!/bin/bash
# Chạy tự động bởi LocalStack khi edge sẵn sàng (init/ready.d).
set -euo pipefail

# Only S3 is consumed by the apps (storage modules read R2_*); see CONTEXT-MAP.
awslocal s3 mb "s3://webdevstudios-storage" || true

echo "localstack initialised"

# Bài 0 — AWS giả lập trên xiroserver-lan (LocalStack)

**Mục tiêu:** thực hành S3/SQS/Secrets Manager với `aws` CLI và với chính app trong repo, không chạm tài khoản thật, không tốn tiền.

## Trần của LocalStack (biết trước để khỏi ngộ nhận)

LocalStack giả lập tốt: S3, SQS, SNS, DynamoDB, Secrets Manager, IAM (kém), Lambda (chạy trong container). **Không** giả lập ECS, ALB, RDS, CloudFront, WAF — phần đó học trên AWS thật. Nó là sandbox cho *mặt dữ liệu*, không phải sandbox cho *mặt compute*.

## Cài trên xiroserver-lan

```bash
git clone <repo> && cd webdevstudios/scripts/localstack
docker compose up -d          # RAM ~1GB, disk ~2GB
docker compose logs -f localstack | grep initialised  # init xong
```

CLI trỏ vào nó (bất kể máy nào trong LAN):

```bash
export AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test AWS_DEFAULT_REGION=ap-southeast-1
export AWS_ENDPOINT_URL=http://xiroserver-lan:4566
aws s3 ls                      # phải thấy bucket webdevstudios
aws sqs list-queues            # order-events
```

## Bài tập với app thật

```bash
# api-elysia upload file vào "S3" giả lập thay vì R2:
R2_ENDPOINT=http://xiroserver-lan:4566 R2_BUCKET_NAME=webdevstudios \
R2_ACCESS_KEY_ID=test R2_SECRET_ACCESS_KEY=test bun run --cwd apps/api-elysia dev
```

1. Upload 1 ảnh qua API → `aws s3 ls s3://webdevstudios --recursive` thấy object.
2. Xoá object bằng CLI → gọi lại URL public (sẽ fail — R2 public URL chỉ có ở bản thật, LocalStack phải signed URL).
3. `aws secretsmanager get-secret-value --secret-id webdev/local/app` — so với cách ECS đọc secret trong prod-stack.

## Trong CI

Bật cùng compose, `docker compose up localstack` rồi trỏ test e2e vào `http://localhost:4566` — làm sau, khi có test e2e.

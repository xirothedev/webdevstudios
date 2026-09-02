# L10 — API design

## 10.1 REST core

```
GET    /orders?cursor=eyJpZCI6MTIzfQ&limit=20     # cursor = base64(opaque)
POST   /orders                    → 201 + Location
PUT    /orders/42                 → idempotent (replace)
PATCH  /orders/42                 → partial, JSON Merge Patch hoặc JSON Patch
```
Pagination: OFFSET 100000 = scan+vứt 100k dòng → chậm dần. Cursor:
```sql
WHERE (created_at, id) < (?, ?) ORDER BY created_at DESC, id DESC LIMIT 20
-- keyset: ổn định khi có insert giữa trang, không nhảy/trùng record
```

## 10.2 Idempotency

```
POST /payments
Idempotency-Key: 7d3a-...           # client sinh (UUID), gửi lại khi retry
```
Server: `UNIQUE(idempotency_key)` — request trùng trả về KẾT QUẢ ĐÃ LƯU của request đầu, không tạo payment mới. Bắt buộc cho: tiền, đơn hàng, webhook consumer.

## 10.3 Versioning

Additive-first: thêm optional field = không break ai → không cần version. Break (đổi type, xoá field) → version. URL (`/v2`) dễ debug + CDN cache riêng; header sạch sẽ nhưng debug khó hơn. Org thường: URL.
Deprecation policy: trả `Deprecation` + `Sunset` header, báo trước ≥ 1 chu kỳ release.

## 10.4 Error contract (RFC 7807)

```json
{ "type": "https://api.x.com/errors/out-of-stock", "title": "Out of stock",
  "status": 409, "code": "OUT_OF_STOCK", "detail": "Sản phẩm SP1 còn 2, bạn đặt 3" }
```
Client switch trên `code` (ổn định), hiển thị `detail` (thay đổi được). Đừng bắt client parse message.

## 10.5 Type-first API

Nest + `@nestjs/swagger`: DTO decorator → OpenAPI JSON → client type tự sinh.
tRPC (Next↔Nest cùng monorepo): type suy ra từ server, không schema file. Trade-off: tRPC lock 2 đầu vào TS/Nest, mất OpenAPI cho team ngoài → tổ chức 2 audience (internal + public) thì cả hai, mỗi loại cho mỗi audience.

## 10.6 GraphQL

Chọn khi: nhiều frontend khác nhau cần shape dữ liệu khác nhau trên cùng graph; tránh khi: auth phức tạp theo field, hoặc bạn chưa xử lý được N+1 (DataLoader) + persisted query + depth limit. Chi phí ẩn: 1 endpoint = rate limit khó hơn, caching CDN mất gần hết (vì POST /graphql một URL).

```
// N+1 GraphQL: products → 50 resolver con gọi 50 query — fix bằng DataLoader batch
```

## 10.7 Upload (org standard: inline multipart)

```
POST /orders  (multipart/form-data)
  fields: dto (JSON string)
  files:  receipt[]  (binary parts)
→ mediaUpload interceptor: validate mime/size → ghi storage → thay parts bằng URL trong req.body → DTO validation thấy url
```
Vì sao anti-pattern presign-PUT ở đây: thêm service + thêm round-trip + client tự quản lý expiry, trong khi mọi endpoint đã auth sẵn. Nêu được 1 lý do presign THẮNG (upload 5GB thẳng lên S3 không đi qua app) = trung thực trade-off.

## 10.8 Rate limiting

```
Sliding-window (Redis sorted set): chính xác, cần Redis
Token bucket: cho phép burst (bucket size) + refill rate — chọn mặc định
Key: user:{id} (chặn theo tài khoản — đúng hơn IP vì NAT), fallback IP
→ 429 + Retry-After: 30
```
Multi-instance: limiter phải ở Redis/edge, không phải in-memory counter (mỗi instance 1 sổ = limit × N).

## 10.9 Webhook outbound

```
POST khách hàng, headers:
  X-Webhook-Signature: t=1712345,v1=hmac_sha256(secret, t + "." + raw_body)
receiver: so sánh timing-safe; body + timestamp chống replay
retry: 1m, 5m, 30m... 5 lần → DLQ + cảnh báo; receiver phải idempotent (delivery id)
```

## 10.10 Realtime

SSE: notification, log tail, LLM tokens. WebSocket: cùng vẽ, chat, presence.
Multi-instance: socket kết nối vào instance A, event publish từ instance B → Redis pub/sub làm bus (L15.7). Auth WS: cookie/ticket lúc upgrade, verify trước khi accept.

## 10.11 Public API thinking

- mọi field là hợp đồng: xoá = break
- changelog + deprecation header (10.3), sandbox key, pagination bắt buộc cho list, `Idempotency-Key` cho mọi POST tiền

**Check:** thiết kế API "chuyển khoản" — trên giấy: method, status codes, idempotency, rate limit key, error contract. 5 phút, không tra.

# L15 — System design (vòng quyết định)

## 15.1 Framework 7 bước (45 phút)

```
1 (5'):  Requirement. Functional: gì? Non-functional: QPS? p99? data volume? team? đọc/ghi tỉ lệ?
2 (5'):  Estimation (15.2). Chốt con số to đùng nào ảnh hưởng quyết định.
3 (5'):  API + data model.
4 (10'): High-level diagram. Client → LB → app → cache/DB/queue.
5 (10'): Deep dive theo interviewer chỉ (thường: 1 thành phần nổ to nhất).
6 (5'):  Bottleneck + scale path: đọc replica, cache, sharding, queue.
7 (5'):  Trade-off tổng: bạn đã đổi gì lấy gì.
```
Luật vàng: mọi quyết định có câu "vì X, đổi lại là Y". Im lặng chọn công nghệ = fail.

## 15.2 Estimation — số nên nhớ

```
1 ngày ≈ 10^5 giây
1k req/s × 1KB = 100MB/s ≈ 8TB/ngày
100M user × 1 req/ngày = 1.2k req/s trung bình → peak ×5 = 6k req/s
1 ngày 1M đơn × 2KB = 2GB/ngày → 700GB/năm (DB chính vẫn sống tốt)
RAM 1 máy 32GB ~ chứa 16M row × 2KB nếu cache nóng 50%
```
Bài tập: "YouTube 300 giờ video upload/phút, mỗi video 1080p ~4GB" → bao nhiêu TB lưu trữ, bao nhiêu transcode giờ/ngày. (Estimate ra con số, không cần đúng, cần lộ cách nghĩ.)

## 15.3 Load balancing

L4: route theo IP/port (nhanh, không hiểu HTTP). L7: route theo path/host/header — cần cho canary, A/B, TLS termination.
Algorithm: round-robin (mọi thứ stateless), least-conn (request độ lệch lớn), consistent hash (khi cần sticky có lý do — cache warmth).
Sticky session là smell: giải pháp thật = state ra ngoài (session store Redis, JWT).

## 15.4 Horizontal scaling app

Điều kiện tiên quyết: app vô state. Việc phải làm:
- session → Redis/JWT (11.1)
- cache in-process → Redis (12.7)
- background job trong process → queue (15.7)
- local upload disk → object storage (S3)
Nói được 4 thứ trên = trả lời xong "scale từ 1 → 10 instance làm gì".

## 15.5 Caching chiến lược

- cache-aside (mặc định), write-through, write-behind (9.8)
- invalidate by tag: sản phẩm đổi → xoá `product:42` + mọi `page:*` gắn tag đó
- thundering herd: 10k request cùng miss 1 key → 10k query DB. Fix: **single-flight** (1 request đi về nguồn, số còn lại chờ kết quả đó) hoặc jitter TTL ±10%.

```ts
// single-flight: mọi request cùng key dùng chung 1 promise đang chạy
const inflight = new Map<string, Promise<any>>();
async function get(key: string) {
  if (inflight.has(key)) return inflight.get(key)!;
  const p = loadFromDB(key).finally(() => inflight.delete(key));
  inflight.set(key, p); return p;
}
```

## 15.6 Database scale

Bậc thang (leo từng bậc, đừng nhảy):
```
1 instance to hơn  →  index/query tối ưu (L9)  →  read replica (báo cáo, đọc)
→  cache giảm tải đọc  →  partition table sự kiện  →  sharding theo tenant/user  →  CQRS tách write model
```
Replication lag: "vừa đặt hàng, trang confirm đọc replica → chưa thấy đơn" → pattern: đọc từ primary trong session của chính user đó (read-your-writes).
Sharding key: `user_id` (thời điển hình: mọi query của 1 user nằm 1 shard) vs hash(order_id) — đo access pattern trước khi chọn.

## 15.7 Async / messaging

```
BullMQ (Redis, <10k job/s, dễ — org đang có): retry/backoff/DLQ có sẵn
Kafka: event log nhiều consumer, replay, >100k msg/s
SQS: serverless, không thứ tự tuyệt đối
```
Delivery semantics: network không có exactly-once — "exactly-once" thật = at-least-once + **idempotent consumer** (dedupe key, upsert).
Outbox pattern — khi DB write + event phải nguyên tử:
```sql
BEGIN; UPDATE orders SET status='paid'; INSERT INTO outbox(event, payload); COMMIT;
-- worker: đọc outbox → publish Kafka/queue → đánh dấu sent (at-least-once, consumer idempotent)
```
Vì sao không publish thẳng sau commit: commit xong, crash trước khi publish = event mất vĩnh viễn, downstream lệch.

## 15.8 Resilience patterns

- timeout ở MỌI tầng gọi ra ngoài (app→DB, app→payment); không timeout = thread/connection leak khi chậm
- circuit breaker: 5 lỗi liên tiếp → mở mạch 30s → thử lại nửa_open_ — chặn cascade, cho dịch vụ bệnh nghỉ
- bulkhead: pool riêng cho payment và report (1 cái nghẽn không giết cái kia)
- backpressure: 429 + Retry-After (10.8), queue có giới hạn + drop policy

## 15.9 Real-time hệ lớn

Feed/chat: fan-out on write (post → ghi N inbox người follow, đắt khi follow 1M — celebrity problem) vs fan-out on read (đọc gộp realtime, rẻ khi ghi nhiều).
Giải celebrity: hybrid — sao dùng on-read, người thường on-write; cache timeline.
Presence: Redis + heartbeat TTL, socket multi-instance qua pub/sub (L10.10).

## 15.10 Sáu bài kinh điển — outline decisions (luyện mỗi bài 30', vẽ + nói to)

**URL shortener**: POST /{code} lưu `code→url` (hash 7 ký tự base62, unique constraint + retry). Đọc: cache Redis 90% hit, DB sharding theo code. Vấn đề: collision, read:write 100:1 → cache là chính.
**Notification system**: API nhận → queue → worker per kênh (email/push) với retry backoff + idempotency key (gửi trùng = bug user-visible). Preference + rate cap per user chống spam. DLQ khi 5 lần fail.
**News feed**: 15.9 fan-out hybrid. Feed cache theo user, TTL ngắn, cập nhật bằng append.
**Chat**: WebSocket + heartbeat; lưu message per-conversation shard; "message được gửi" ≠ "đã đọc" → ack 2 tầng (delivered, read); history = DB, realtime = pub/sub.
**Web rate limiter**: 15.8 + Redis sliding window (sorted set: `ZADD key now id; ZREMRANGEBYSCORE`), atomic bằng Lua script (client nào đến trước cũng thấy cùng bức tranh).
**YouTube-lite upload**: client → presigned S3 (upload 4GB không qua app — trường hợp presign THẮNG 10.7) → event upload.done → queue → transcode farm (worker riêng) → nhiều bitrate → CDN. Storage: original + derivatives; cost: egress lớn nhất.

**Distributed lock**: Redis `SET key token NX PX 30000` + release bằng Lua so token. Nói được vì sao NGUY HIỂM: lock expiry trong khi việc chưa xong → 2 holder; fencing token (số tăng dần, resource từ chối token cũ) mới là fix thật. Interview bẫy: "dùng lock phân tán để decrement stock" — sai, dùng DB atomic update (9.3).

## 15.11 Trade-off vocabulary (dùng thành câu)

- consistency vs availability: chọn C cho balance (double-spend không chấp nhận), chọn A cho view count
- latency vs throughput: batch (throughput↑, latency↓) cho báo cáo; realtime từng dòng cho checkout
- monolith → microservice khi: team >2 sprint-autonomous teams, cần scale/scale team khác nhau — và recovery path khi sai: modular monolith với module boundary thật (L8.2, L16) là đường quay lại dễ hơn chia tay rồi hàn
- build vs buy: auth (Clerk/Auth0) vs domain core (không bao giờ buy)

**Check cuối tầng:** làm lại 1 bài trong 15.10 bằng cách ghi âm 30 phút tự thuyết trình, nghe lại đếm được bao nhiêu câu "vì... đổi lại...".

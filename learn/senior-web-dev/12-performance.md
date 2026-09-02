# L12 — Performance engineering

## 12.1 Nguyên tắc: không số liệu = không claim

Quy trình 4 bước lặp lại mọi lúc: ① chọn metric (p95 latency, không phải median — user nằm ở đuôi) ② đo hiện trạng ③ sửa 1 thứ ④ đo lại, giữ nếu thắng.

## 12.2 Backend diagnosis

```bash
# event loop lag metric (prom-client + monitorEventLoopDelay) tăng → tìm task dài
node --cpu-prof server.js          # .cpuprofile → DevTools flame graph: đỉnh rộng = hàm ngốn CPU
clinic.js                          # autocannon -c 100 http://localhost:3000   (tải giả lập)
```
Đỉnh flame graph thường là: `JSON.parse` body 10MB, synchronous crypto, regex backtrack, deep clone.

## 12.3 N+1 ở tầng API

Trang dashboard gọi 40 endpoint (40 × TLS + 40 × auth + 40 × RTT). Fix sai: "thêm React Query cache". Fix đúng: composition endpoint — `GET /dashboard` server tổng hợp 1 response. Client cache chỉ che triệu chứng, không giảm work.

## 12.4 Bundle frontend

```bash
ANALYZE=true next build       # next/bundle analyzer: nhìn biểu đồ tree-map
```
Thủ phạm lặp lại: moment (dùng `Intl`), lodash cả con (dùng `lodash-es` hoặc import hàm lẻ), chart lib nạp cả bundle cho 1 widget, client component ở GỐC kéo theo mọi thứ (L6.3 boundary).

## 12.5 TTFB chain

`DNS → TCP → TLS → TTFB → streaming` — với Next: TTFB = middleware + server render + DB.
KPI nói trong interview: "p95 TTFB 300ms → 80ms bằng cách bỏ query DB khỏi middleware (đổi sang edge config) + cache header theo user."

## 12.6 Image & media

`srcset` đúng (điện thoại không tải 2560px), CDN cache ảnh resize (`Cache-Control: public, max-age=31536000, immutable`), text/CSS/JS nhỏ. Chi tiết nằm ở 4.5 + 6.8.

## 12.7 Cache pyramid

```
in-process Map (1 instance, bay khi deploy)   → chỉ cho dữ liệu hot, TTL ngắn, chấp nhận miss khi scale
Redis (dùng chung, p99 ~1ms)                  → session, rate limit, cache query
CDN (edge, gần user)                           → asset, trang cache được
browser cache                                  → free, kiểm soát qua Cache-Control
```
Mỗi tầng invalidate KHÁC nhau: in-process không có cách broadcast invalidation → dùng Redis pub/sub hoặc chấp nhận TTL. Interview: "cache user profile của bạn invalidate khi user đổi tên ở instance khác bằng cách nào?"

## 12.8 Queue offload

Câu hỏi quyết định: request CÓ CẦN kết quả để trả lời không?
- có → giữ trong request, thêm timeout
- không (email, resize, notification, đối soát) → job queue, trả 202 Accepted
Quy tắc 202 + polling/webhook thay vì giữ connection 30s.

## 12.9 DB performance

```sql
log_min_duration_statement = 200ms   → log query chậm
SELECT * FROM pg_stat_activity WHERE state = 'active' AND now()-query_start > '5s';  -- long-running
pg_locks: lock contention khi UPDATE cùng dòng nóng → thiết kế lại (decrement atomic)
```
Index covering (9.2) sửa được "quét nhiều"; không sửa được "row quá rộng + fetch tất" — đó là việc của `select` columns.

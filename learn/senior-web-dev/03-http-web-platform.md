# L3 — HTTP & web platform

## 3.1 HTTP/1.1 semantics

- safe: GET/HEAD — không đổi trạng thái server
- idempotent: PUT/DELETE — gọi N lần = 1 lần (POST không)
- vì sao quan trọng: browser/proxy CHỈ tự retry khi idempotent. Payment bằng GET = thảm họa.

```http
POST /orders HTTP/1.1
201 Created
Location: /orders/42          ← thiếu cái này = API nghiệp dư
```
400 = request sai cú pháp. 422 = cú pháp đúng, nghiệp vụ sai (email hợp lệ nhưng đã tồn tại). 409 = xung đột trạng thái (double-submit). Interview hỏi 400 vs 422 vs 409: trả lời bằng ví dụ trên.

## 3.2 HTTP/2 &/3

HTTP/1.1: 1 connection = 1 response tại một thời điểm → browser mở 6 socket, vẫn head-of-line blocking.
HTTP/2: 1 socket, nhiều stream xen kẽ — fix ở tầng app, nhưng mất packet → stall cả socket (TLS nằm dưới).
HTTP/3/QUIC: UDP, mỗi stream độc lập mất packet. Không cần "làm gì thêm" — bật ở edge/CDN, hiểu để nói.

## 3.3 TLS 1.3

ClientHello → ServerHello+cert+key-share → ClientFinished. 1-RTT.
Certificate chain: leaf → intermediate → root (root nằm trong OS store, không ship).
Private key không rời server — proof danh tính bằng chữ ký, không bao giờ gửi key.
SNI: server nhiều cert trên 1 IP, chọn cert theo tên trong ClientHello (hiện bằng plaintext — lý do có ECH).

## 3.4 Cache — nơi senior bị soi

```http
Cache-Control: public, max-age=31536000, immutable   # /assets/logo.3f2a1c.png (hashed filename)
Cache-Control: private, no-store                      # API trả HTML có tên user
Vary: Accept-Language, Cookie                         # CDN cache riêng theo 2 header
stale-while-revalidate=60                             # phục vụ bản cũ trong lúc làm mới
```
Bài check (đề bài ở LEARNING-PATH): ảnh `Vary: Cookie` → mọi request có Cookie header khác nhau = cache key khác nhau → CDN miss gần 100%. Fix: không set cookie trên domain asset, hoặc bỏ Vary: Cookie.
ETag vs Last-Modified: ETag chính xác cả khi nội dung đổi cùng giây; 304 không có body.

## 3.5 Content negotiation & multipart

```http
Accept: application/json          # client muốn gì
Content-Type: multipart/form-data; boundary=----xyz
```
Multipart = nhiều part (field text + file binary) trong 1 body, phân cách bằng boundary — đây là format upload của org rule (interceptor mediaParse đọc từ đây, L8.7/L10.7).

## 3.6 Cookie

```http
Set-Cookie: sid=abc; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400
```
- `HttpOnly`: JS không đọc được — chặn 90% hậu quả XSS
- `SameSite=Lax`: cookie KHÔNG gửi khi user bị site khác redirect tới (POST cross-site chặn hẳn)
- `SameSite=None` bắt buộc kèm `Secure`
- Vì sao SameSite phá CORS-with-credentials: fetch phải `credentials:'include'` + server trả `Access-Control-Allow-Credentials: true` + KHÔNG được `Allow-Origin: *`.

## 3.7 CORS

Prefight nổ khi: method không phải GET/HEAD/POST, header tùy chỉnh (Authorization, Content-Type: application/json), hoặc credentials.

```
OPTIONS /api/orders
Origin: https://admin.example.com
Access-Control-Request-Method: POST

204
Access-Control-Allow-Origin: https://admin.example.com
Access-Control-Allow-Headers: authorization, content-type
Access-Control-Max-Age: 86400      # cache preflight, giảm latency
```
Sửa ở edge (CDN/nginx) hay app: nhiều service sau 1 gateway → sửa gateway 1 lần; nhưng app vẫn nên validate origin riêng cho route nhạy cảm.

## 3.8 URL encoding

```js
const q = encodeURIComponent('a&b');   // 'a%26b' — encode CHỖ VALUE, không encode cả query string
new URL('/search?q=' + q, 'https://x.com').searchParams.get('q'); // 'a&b'
```
Bug kinh điển: nối string URL thay vì `URL` API → `&` trong dữ liệu = tham số giả = injection điểm.

## 3.9 SSE vs WebSocket vs long-poll

| Hướng | Proxy-friendly | Kết nối | Dùng khi |
|---|---|---|---|
| SSE (1 chiều server→client) | HTTP thường | 1, tự reconnect | notification, token stream LLM |
| WebSocket (2 chiều) | cần upgrade | 1, giữ trạng thái | collaborative editor, game |
| long-poll | HTTP thường | mỗi lần 1 req | fallback, polling dữ liệu ít đổi |

```js
// SSE — server Node
res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
res.write(`event: tick\ndata: ${JSON.stringify(payload)}\n\n`);
```

## 3.10 Range & compression

`Range: bytes=0-1023` → 206 Partial Content — resume download, video seek.
`Content-Encoding: br` (Brotli) nhỏ hơn gzip ~15%; `Accept-Encoding` để client declares; CDN quyết định.

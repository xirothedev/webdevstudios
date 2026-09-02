# L11 — Auth & security

## 11.1 Session vs JWT

Web app có logout:
- Session server: `sid` cookie HttpOnly → lookup Redis/DB → revocable tức thì. Giá: 1 lookup/request (Redis p99 < 1ms — nói được con số).
- JWT stateless: không lookup, NHƯNG logout phải blacklist (lại thành stateful). JWT còn lộ vấn đề rotation key (JWKS) và token sống hết TTL dù user bị khoá.

Kết luận senior: browser session → session cookie. JWT cho: service-to-service (mTLS hoặc JWT + short TTL), refresh token, mobile.

## 11.2 OAuth2 / OIDC

Authorization Code + PKCE (SPA/mobile = public client, không giấu được secret):
```
1. redirect → authorize?client_id=..&code_challenge=SHA256(verifier)&method=S256
2. callback: ?code=abc
3. POST /token: code + code_verifier (rò ra network cũng dùng được gì? không — verifier khác challenge)
4. access (15') + refresh (rotation: mỗi lần dùng trả refresh MỚI, refresh cũ dùng lại = reuse → revoke cả family)
```
`scope` = client xin gì; permission = user được gì — 2 trục khác nhau, đừng gộp.

## 11.3 Password

- hash ≠ encrypt: không có đường ngược lại
- argon2id (memory-hard: GPU/ASIC không brute-force rẻ như với bcrypt)
- pepper (secret riêng app, khác salt per-user) khi DB rò vẫn thiếu 1 mảnh
- reset: token random 256bit, HASH lưu DB, single-use, TTL 15', gửi qua email kèm invalidate các token cũ

## 11.4 OWASP top hits (kèm fix cụ thể)

```js
// SQLi: ORM không tự miễn khi bạn ghép chuỗi
prisma.$queryRawUnsafe(`... WHERE name = '${name}'`)          // ❌
prisma.$queryRaw`... WHERE name = ${name}`                     // ✅ parameterized
// SSRF: user truyền imageUrl, server fetch → attacker thử http://169.254.169.254/ (metadata), http://localhost:9200
// fix: allowlist domain, chặn private IP ranges, không theo redirect
// Path traversal: filename từ user: "../../etc/passwd" → basename + uuid rename, không dùng tên gốc
// Mass assignment: whitelist:true pipe (L8.5)
```

## 11.5 Security headers baseline

```
Content-Security-Policy: default-src 'self'; script-src 'nonce-…'   (Next: next/headers nonce hoặc config CSP)
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Frame-Options: DENY   / CSP frame-ancestors 'none'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=()   // tắt những gì không dùng
```

## 11.6 Secrets

- `NEXT_PUBLIC_*` = BUNDLED VÀO JS — client thấy. Secret thật: server-only (env runtime, không build arg)
- runtime env từ secret manager (SSM/Vault), không nằm trong image
- CI: secret scanning trong pipeline (org audit rule soi đúng mục này), rot khi nghi ngờ rò

## 11.7 Authorization

RBAC: `user.role IN ('admin')` trong guard — đủ khi permission đơn giản.
ABAC/policy: "chỉ sửa order CỦA MÌNH TRỪ khi manager" — đặt ở service vì cần context record.

Confused deputy — lỗi số 1 của mid-level:
```ts
// ❌ req.user chỉ để check đăng nhập, lấy id TỪ BODY
updateOrder(req.user.id, dto.orderId)  →  sửa được order của người khác nếu DTO.orderId của ai đó
// ✅ query ràng buộc owner: WHERE id = dto.orderId AND user_id = req.user.id
//    hoặc policy so sánh owner TRƯỚC khi mutate
```

## 11.8 Supply chain

- commit `package-lock.json`, CI dùng `npm ci`
- `npm audit` + Dependabot/Renovate; pin major version
- postinstall script là vector (event: sự cố package bị chiếm → script cài miner): `ignore-scripts=true` cho deps không cần build, hoặc allowlist qua `onlyBuiltDependencies` (npm 10+)

**Check:** user báo "tôi logout rồi mà tài khoản vẫn bị truy cập qua link cũ". Bạn điều tra theo thứ tự nào? (token TTL → refresh rotation có bật không → cookie scope/`SameSite` → session store revocation → log phát hiện reuse detection)

# L16 — Architecture & craft

## 16.1 Deep module (org rule)

Depth = hành vi che được bao nhiêu trên mỗi đơn vị interface.

```
Shallow module:  10 hàm export / 50 dòng logic   → interface gần bằng implementation → vô dụng
Deep module:     1 hàm `sendOtp(phone)`          → giấu: rate limit, retry, template, provider fallback
```
Ví dụ org: `packages/otp` chỉ export `sendOtp`, `verifyOtp`. Consumer không biết provider là Twilio hay FalconSMS. Đổi provider = sửa bên trong, không đổi caller.

## 16.2 Dependency direction

```
domain/        ← không import NestJS, không import Prisma (chứa rule + entity thuần)
application/   ← use cases, nhận interface (ports)
infrastructure/→ implements ports: Prisma repo, Twilio client   (adapters)
interfaces/    → Nest controllers, Next server actions
```
Hexagonal đáng khi: business rule phức tạp, sống >5 năm (fintech). Quá đáng khi: CRUD nội bộ 3 tháng sống — lúc đó domain không import framework = ceremony rỗng. Nói được cả 2 chiều = điểm senior.

## 16.3 DDD chiến thuật (đủ dùng)

```ts
// Value object: equality theo giá trị, tự validate lúc tạo
class Money { constructor(private cents: number) { if (cents < 0) throw ... } }
// Entity: có identity (OrderId), trạng thái đổi, identity giữ nguyên
// Aggregate: Order = root; thêm item PHẢI đi qua Order.addItem() — invariant "tổng = Σ items"
//   không ai sửa OrderItem trực tiếp → repo load/save theo aggregate
// Domain event: OrderPaid → listener gửi email, ghi ledger — side effect ra khỏi transaction chính (qua outbox 15.7)
```
Bounded context: `Orders` (sales) và `Fulfillment` (warehouse) cùng có khái niệm "Order" nhưng shape khác → 2 model riêng + anti-corruption layer dịch giữa.

## 16.4 Context map (org đang làm sẵn)

`CONTEXT-MAP.md` → mỗi app có `CONTEXT.md` glossary. Task của bạn: khi implement, dùng đúng từ trong glossary; phát hiện term mơ hồ → challenge (đây là skill bạn vừa học: domain-modeling).

## 16.5 Consistency giữa services

- 1 transaction 1 DB: invariant phải nằm trong 1 aggregate/shard
- saga orchestration (1 điều phối, dễ theo dõi, đi kèm single-point) vs choreography (event dây chuyền, không ai sở hữu flow → debug địa ngục khi >3 bước)
- compensation: step 2 fail → chạy step 1 ngược (trừ tiền → hoàn tiền), thiết kế MỖI bước có bước lùi trước khi viết
- eventual consistency chấp nhận ở: search index, analytics, notification. KHÔNG chấp nhận ở: số dư, kho hàng, vé máy bay.

## 16.6 Code smell senior soi (org audit list)

```ts
const user = (res as any).data.user as User;   // type-bypass cast = hệ thống đang nói dối bạn
if (state === 'x' && foo) {...} // switch scattered: cùng 1 state machine nếu khắp 5 file
```
Smells: shared mutable module state, abstraction có đúng 1 implementation, config cho giá trị không đổi bao giờ, comment kể lại code ("// set name to name"), `try{}catch(e){}` swallow, deep nesting 4 tầng.

## 16.7 Refactor chiến thuật

1. tạo seam để test được (chèn interface DI vào chỗ không test được)
2. viết test khoá hành vi cũ
3. refactor trong test
4. strangler fig: thay hệ thống cũ bằng cách dựng lớp mới SONG SONG, migrate theo traffic % (route by tenant), không bao giờ rewrite-big-bang

## 16.8 Error design

Boundary: domain → trả `Result`/throw DomainError; transport (Nest filter) → dịch 1 chỗ sang HTTP. Service KHÔNG import HttpStatus. Lỗi lạ → crash loud + filter chung → 500 + log. Không `catch(e) { return null }` — mất thông tin, bug không tìm được thủ phạm.

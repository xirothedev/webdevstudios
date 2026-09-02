# L13 — Testing

## 13.1 Phân bổ thực dụng

```
unit (nhiều, ms):     logic thuần — pricing rules, state machine, parser, validator
integration (vừa):    1 service + testcontainer PG/Redis — repository, transaction, authz
e2e Playwright (ít):  5–15 kịch nghiệp vụ quan trọng nhất, chạy API THẬT (org rule)
```
Tỉ lệ sai điển hình: 80% e2e chậm chạp + flaky, hoặc unit test mock hết tới mức refactor là chết hết.

## 13.2 Testable = thiết kế đúng

```ts
// không test được: phụ thuộc ẩn, Date.now() randomness, global singleton mới trong hàm
// test được: ranh giới rõ, truyền qua DI
@Injectable() class ExpiryService { constructor(private clock: Clock, private repo: CouponRepo) {} }
// test: fake clock → coupon hết hạn lúc 23:59:59 test được deterministic
```
Code khó test = thiết kế sai, không phải "test viết khó".

## 13.3 Mock đúng chỗ (org rule)

```
mock:  payment gateway, email provider, OCR, thời gian
KHÔNG mock: DB (testcontainers), HTTP layer của chính app (supertest), queue (BullMQ dùng memory Redis)
```
Mock-echo test = slop:
```ts
it('gọi create', () => { svc.create(x); expect(repo.create).toHaveBeenCalledWith(x); }); // test rỗng — chỉ assert mock với chính nó
```

## 13.4 TDD ở đâu

Đáng: business rule có branching (pricing, phân quyền, state transition), parser, thuật toán sync dữ liệu.
Không đáng: CRUD scaffold, wiring DI, component presentational.
Vòng đỏ-xanh-nâu: viết test fail bằng đúng hành vi mong đợi → code tối thiểu cho pass → refactor.

## 13.5 Flaky

```ts
// ❌ await new Promise(r => setTimeout(r, 2000));          // đoán thời gian
// ✅
await expect(page.getByText('Chào mừng')).toBeVisible();     // auto-wait condition
await poll(() => db.order.count({ where: { status: 'done' } }) === 1, { timeout: 5000 });
```
Nguồn flaky #1: state chia sẻ giữa test (cùng DB row, cùng Redis key) → mỗi test 1 dataset riêng hoặc rollback transaction.

## 13.6 Coverage

Dùng để tìm vùng tối (branch nào chưa ai đi qua), KHÔNG chạy theo %. Test có assert về hành vi sai khi code sai; test tautology `expect(true).toBe(true)` / snapshot 500 dòng không ai đọc = nợ, không phải tài sản.

## 13.7 Playwright tổ chức

```ts
// storageState: login 1 lần, tái dùng cho các test sau (auth setup project)
// fixtures: test.extend({ order: async ({ db }, use) => { const o = await seed(); await use(o); await cleanup(); } })
// CI: --retries=0 cho main branch (flaky lộ rõ), artifact video+trace khi fail
npx playwright test --project=chromium --workers=4   // song song mặc định theo file
```

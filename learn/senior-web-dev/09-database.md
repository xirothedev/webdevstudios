# L9 — Database (PostgreSQL + Prisma)

## 9.1 Relational model

- 1:N `Order` → `OrderItem` (FK ở phía N)
- M:N `Product` ↔ `Tag` → join table `ProductTag(product_id, tag_id, PRIMARY KEY(cả 2))`
- FK: `ON DELETE CASCADE` (order item mất theo order) vs `RESTRICT` (không xoá được khi còn tham chiếu — mặc định an toàn cho dữ liệu tiền)
- Soft delete (`deletedAt`) phá UNIQUE: 2 bản ghi xoá trùng email → unique vẫn nổ. Fix: partial unique index `WHERE deleted_at IS NULL`.

## 9.2 Index

B-tree: tìm theo thứ tự sắp xếp, O(log n). Composite index quan trọng ở THỨ TỰ cột:

```sql
CREATE INDEX idx_order_user_created ON orders (user_id, created_at DESC);
-- chạy: WHERE user_id=? ORDER BY created_at DESC  → index scan thẳng
-- KHÔNG chạy cho: WHERE created_at=? (cột đầu không xuất hiện)
-- (user_id=?, created_at=?) OK nhưng (created_at=?, user_id=?) vẫn dùng được index này — query planner tự hoán vị
```
```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;
-- Seq Scan cost=... actual time   → chưa có index hoặc table quá nhỏ
```
Covering index: index chứa cả cột SELECT → không phải về table heap. Cái index KHÔNG sửa được: query trả `SELECT *` 80 cột — index scan vẫn phải fetch row → chọn cột thật cần (Prisma `select`).

## 9.3 Transactions & isolation

Mặc định Postgres: READ COMMITTED.

Race condition kinh điển — check-then-insert:
```sql
-- 2 request cùng lúc đều thấy "chưa có coupon" → cả 2 insert
-- ❌ app lock (Redis) = thêm phụ thuộc, vẫn race nếu quên
-- ✅ DB unique constraint: INSERT lần hai nhận lỗi 23505 → app bắt lỗi = đã tồn tại
```
Lost update:
```sql
-- ❌ SELECT balance → update trong app (mất 1 trong 2 giao dịch)
-- ✅ UPDATE accounts SET balance = balance - 100 WHERE id = ?  -- atomic ngay trong SQL
-- hoặc SELECT ... FOR UPDATE khi logic phức tạp hơn 1 câu
```

## 9.4 N+1

```ts
// log: 1 query cha + N query con (bật Prisma log: ['query'])
const orders = await prisma.order.findMany();
for (const o of orders) o.items = await prisma.orderItem.findMany({ where: { orderId: o.id } }); // N+1
// fix 1: include (join) — 1-2 query
// fix 2: batch — findMany({ where: { orderId: { in: ids } } }) rồi group bằng Map
```

## 9.5 Connection pool

- PrismaClient pool default: `num_cpus * 2 + 1` connections — NHƯNG serverless: mỗi lambda 1 client → 500 lambda × pool = phá DB
- Fix: PgBouncer (transaction mode) trước DB; pool size per instance = `max_connections / số instance − headroom`
- vì sao không 1 connection/request: TLS+auth ~vài ms mỗi request × QPS = latency + phí

## 9.6 Prisma specifics

- PrismaClient 1 singleton/process (L8.11). Trong Next.js: global singleton chống hot-reload spawn hàng chục pool.
- `$transaction([...])` = atomic (batch, không đọc kết quả giữa các câu); `$transaction(async tx => ...)` = interactive (cần read-modify-write)
- Migrations: `prisma migrate dev` (local) vs `migrate deploy` (CI/CD — không generate lại SQL ở prod)

## 9.7 Senior modeling

- Money: `INTEGER` minor unit (cents) hoặc `NUMERIC(18,2)` — không bao giờ `FLOAT` (0.1+0.2 ≠ 0.3)
- Timezone: `timestamptz` (lưu UTC), display theo user TZ ở app
- Status: enum Postgres (an toàn, mạnh về query) vs varchar + app enum (thêm giá trị không cần migration) — trade-off đã chốt ở L0.3
- ID: UUIDv7 (sortable, không lộ số lượng) vs bigserial (nhỏ hơn, index nhanh hơn, lộ "mình có 1024 user")

## 9.8 Cache–DB consistency

Cache-aside: đọc cache → miss → DB → set cache. Problem: record đổi giữa lúc đọc DB và set cache → cache cũ vĩnh viễn.
Fix thực dụng: TTL ngắn (60s) + invalidation by tag khi ghi (`revalidateTag` L6.5 chấp nhận stale cửa sổ nhỏ). Viết-through: ghi DB xong update cache luôn — chậm hơn 1 chút, stale ít hơn. Write-behind: ghi cache + flush DB sau — chỉ dùng khi đo thấy DB bottleneck (phức tạp, tránh).

## 9.9 Search

`LIKE '%term%'` không dùng được B-tree, full scan. Bậc thang:
1. `pg_trgm` + GIN index — fuzzy vừa phải
2. `tsvector` + GIN — full-text tiếng Anh có ranking; tiếng Việt không có word boundary → cần pg_bigm/pg_trgm hoặc tokenizer ngoài
3. Meilisearch/Typesense — khi cần typo tolerance, faceting, instant search

## 9.10 Scale out

- Read replica: tách báo cáo/dashboard; LƯU Ý replication lag — vừa ghi xong đọc replica thấy dữ liệu cũ (bug production thật)
- Sharding bằng hash: chỉ khi 1 node thật sự chạm trần (đo, rồi hãy nói)
- Partition table theo `created_at`: phù hợp log/events, query luôn kèm time range

## 9.11 Zero-downtime migration (expand–contract)

```
1. thêm cột nullable (release 1)      → code cũ+code mới đều chạy
2. backfill + dual-write               → release 2
3. đọc cột mới, bỏ cột cũ              → release 3
4. DROP cột cũ                         → release 4
```
Never: rename/drop cột cùng release với code dùng nó — window deploy = sập.

**Check:** cho table `orders` 50M dòng, query `WHERE status='pending' AND user_id=? ORDER BY created_at LIMIT 20` chạy 4s. Viết câu trả lời: index nào, tại sao thứ tự cột như vậy, EXPLAIN sẽ đổi Seq→Index như thế nào.

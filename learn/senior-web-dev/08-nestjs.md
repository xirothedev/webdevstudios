# L8 — NestJS (DI + kiến trúc ứng dụng)

## 8.1 DI & lifetime

```ts
@Injectable({ scope: Scope.DEFAULT })   // singleton — mặc định, nhanh nhất
@Injectable({ scope: Scope.REQUEST })   // 1 instance / request — chậm, lý do: phải tạo mới + resolve cả chain
@Injectable({ scope: Scope.TRANSIENT }) // mỗi nơi @Inject được 1 bản mới
```
Bẫy scope explosion: `OrderService(request)` dùng `Logger(default)` → Logger vẫn singleton; NHƯNG chiều ngược lại: service singleton dùng request-scoped repo thì Nest không cho — bạn sẽ phải scope-request CẢ CHUỖI. Hệ quả: mọi provider upstream thành request-scoped, chết hiệu năng.
`forwardRef` = báo động đỏ circular dependency: module A↔B nghĩa là ranh giới sai → refactor (tách phần chung thành module C).

Custom provider:
```ts
{ provide: CONFIG, useFactory: (cfg: ConfigService) => loadConfig(cfg), inject: [ConfigService] }
```

## 8.2 Module boundaries

Module = 1 đơn vị triển khai + 1 public API. `exports` là interface; thứ không export = private.

```ts
@Module({ imports: [PaymentModule], providers: [OrdersService], exports: [OrdersService] })
export class OrdersModule {}
// module khác chỉ chạm OrdersService — KHÔNG import OrderEntity hay OrdersRepository
```
Anti-pattern org audit soi: barrel file export hết mọi thứ (`export * from './internal'`) → interface = 0, refactor không được vì ai cũng import lung tung.

## 8.3 Layering đúng lý do

```ts
OrdersController        // HTTP: parse body, map error → status. Không logic.
  └─ OrdersService      // use case: điều phối, invariant, transaction
       └─ OrdersRepository  // Prisma raw queries
```
Không phải vì sách nói vậy — vì: test service không cần HTTP, đổi transport (REST→gRPC) không đổi service, đổi ORM chỉ đụng repository. Controller import thẳng repository = test service đòi HTTP server.

## 8.4 Request lifecycle (thứ tự phải đọc làu bàu)

```
Middleware → Guards → Interceptors(before) → Pipes → Controller
        → Interceptors(after/tail) → ExceptionFilter (nếu nổ)
```
- Middleware: việc không cần DI metadata (cors, body-limit, request-id)
- Guard: CÓ/KHÔNG vào được (auth, role). Chạy trước khi biết body hợp lệ.
- Interceptor: bọc quanh handler — timing, transform, cache. KHÔNG quyết định authz (đừng giấu if-else auth trong interceptor)
- Pipe: validate/transform input (chỗ duy nhất DTO validation đứng)
- Filter: dịch error → HTTP response

## 8.5 Validation pipeline (org: class-validator)

```ts
export class CreateOrderDto {
  @IsString() @IsUuid() productId!: string;
  @IsInt() @Min(1) qty!: number;
}
// main.ts: app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
```
`whitelist: true` = strip field lạ (chặn mass-assignment). Org twist: mediaUpload interceptor nhận multipart, validate file, ghi file, RÓT URL vào `req.body` TRƯỚC khi pipe chạy → DTO thấy URL như field thường. Nắm để không viết pipe tự parse file (vi phạm upload rule).
Trade-off class-validator vs zod: decorator = schema phân tán trên class, runtime metadata; zod = schema 1 chỗ, sinh type từ schema. Org chốt decorator — biết cả hai để defend lựa chọn.

## 8.6 Guards

```ts
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) { /* verify token → req.user */ }
}
@UseGuards(JwtAuthGuard, RolesGuard('admin'))  // 2 concern, 2 guard — đừng gộp 1
```
`canActivate` chạy mỗi request: query DB trong guard mà không cache → guard thành bottleneck. Pattern: guard chỉ đọc, dữ liệu permission cache trong Redis/req.

## 8.7 Interceptors

```ts
@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(ctx, next: Observable<any>) {
    const t0 = performance.now();
    return next.handle().pipe(tap(() => this.metrics.observe(..., performance.now() - t0)));
  }
}
```
RxJS ở Nest còn đáng không: interceptor/guard API giữ Observable nhưng handler thường trả plain promise — nói được "giữ Observable chỉ khi thật sự cần operator (timeout, retry, cache), còn lại promise" = điểm depth.

## 8.8 Exception strategy

```ts
// domain error (L16.8): service KHÔNG nghĩ tới HTTP
export class InsufficientStock extends Error {}
@Catch(InsufficientStock)
export class InsufficientStockFilter implements ExceptionFilter {
  catch() { throw new ConflictException({ code: 'OUT_OF_STOCK', message: 'Hết hàng' }); }
}
// hoặc 1 filter trung tâm: switch instanceof → status code; lỗi lạ → 500 + log stack, response KHÔNG leak stack
```

## 8.9 Config fail-fast

```ts
const EnvSchema = z.object({ DATABASE_URL: z.string().url(), JWT_SECRET: z.string().min(32) });
// ConfigFactory parse lúc boot → thiếu env = process chết ngay tại startup, không phải ở request đầu tiên
```
Interview: "vì sao không đọc `process.env.X` trong service?" → lỗi lộ lúc runtime, sai 1 env sập 1/10 endpoint, không reproduce được ở test.

## 8.10 Background work

- `@nestjs/schedule` (@Cron): việc chạy trên 1 instance — chạy trên 3 replica = 3 lần. Cần lock hoặc tách 1 service.
- BullMQ (Redis): job queue thật — retry/backoff/DLQ. Email, resize ảnh, webhook fan-out vào đây.
- `@nestjs/event-emitter`: in-process, KHÔNG durable (process chết = mất event). Cần đảm bảo giao → queue (L15.7 outbox).

## 8.11 Prisma integration (org: Prisma 7)

```ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() { await this.$connect(); }
  // singleton — 1 client cho cả app, pool bên trong (L9.5)
}
// transaction scope nằm ở SERVICE, không phải repository method lẻ:
await this.prisma.$transaction(async (tx) => {
  const stock = await tx.product.update({ where: {...}, data: { stock: { decrement: qty } } }); // atomic
  await tx.order.create({ data: {...} });
});
```
Repository ẩn Prisma hoàn toàn hay cho service dùng thẳng Prisma types? Org nghiêng thẳng-thắn + có ranh giới: PrismaClient qua PrismaService, model type chỉ lộ ở boundary mapper.

## 8.12 Auth module

Passport strategy chain: `JwtStrategy.validate(payload)` → attach `req.user`. Access token 15', refresh token rotation + reuse detection (L11.2). Password: argon2id (L11.3).

## 8.13 Testing Nest

```ts
// unit: mock provider
const mod = await Test.createTestingModule({ providers: [OrdersService, { provide: OrdersRepository, useValue: fakeRepo }] }).compile();

// e2e: override PrismaTestContainer, giữ nguyên guard/pipe
@Module({ overrides: [{ provide: PrismaService, useValue: testContainer.prisma }] })
request(app.getHttpServer()).post('/orders').send(dto).expect(201);
```
Org rule: KHÔNG mock DB — testcontainers PG thật (L13.3).

## 8.14 Performance Nest

- Gọi service ngoài: `https.Agent({ keepAlive: true })` — không thì TLS handshake mọi request
- `@nestjs/platform-fastify`: schema-based response serialization (`ClassSerializerInterceptor` + DTO = loại field nhạy tự động), nhanh hơn express cỡ 2×
- Pool DB per instance: 3 replica × pool 20 = 60 conn — Postgres default max 100 → tính trước khi scale (L9.5)

## 8.15 Packages = deep module (org rule)

`packages/` chỉ export qua entrypoint (`index.ts` chọn lọc), implementation ẩn trong subfolder. Có dependency-cruiser config để enforce. Interview: vẽ module graph của app, chỉ ra public API của mỗi module nằm ở file nào.

**Check cuối tầng:** thiết kế module `Wallet` (balance, debit, credit) — nói rõ: public API (interface) là gì, request-scoped cái nào (không cái nào, nếu bạn có idempotency ở service), transaction boundary nằm đâu.

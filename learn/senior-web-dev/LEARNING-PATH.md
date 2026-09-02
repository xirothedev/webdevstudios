# Senior Web Dev Knowledge Map — NestJS / Next.js / TypeScript

Mục tiêu: năng lực senior dài hạn. Phỏng vấn là cột mốc kiểm tra.
Cách dùng: đánh dấu `[x]` = giải thích được trade-off cho người khác, không phải "đã từng dùng".
Thứ tự học: từ dưới lên. Tầng dưới hổng thì tầng trên học vẹt.

---

## File chi tiết (ví dụ minh hoạ cho từng mục nhỏ)

| Tầng | File |
|---|---|
| L0 | 00-nang-luc-senior.md |
| L1 | 01-javascript-runtime.md |
| L2 | 02-typescript.md |
| L3 | 03-http-web-platform.md |
| L4 | 04-browser-frontend.md |
| L5 | 05-react.md |
| L6 | 06-nextjs.md |
| L7 | 07-nodejs-runtime.md |
| L8 | 08-nestjs.md |
| L9 | 09-database.md |
| L10 | 10-api-design.md |
| L11 | 11-auth-security.md |
| L12 | 12-performance.md |
| L13 | 13-testing.md |
| L14 | 14-devops-infra.md |
| L15 | 15-system-design.md |
| L16 | 16-architecture-craft.md |
| L17 | 17-leadership-behavioral.md |
| L18 | 18-phong-van.md |

---

## L0. Mô hình năng lực senior (thang đo)

- 0.1 Kỹ thuật: chiều sâu 1 stack + rộng đủ để hội thoại với mọi tầng
- 0.2 Phán đoán trade-off: chọn phương án và nói được cái gì đánh đổi
- 0.3 Hệ quả dài hạn: quyết định hôm nay ảnh hưởng 2 năm sau
- 0.4 Communicate risk: estimate, nói "không biết", escalate đúng lúc
- 0.5 Nâng người khác: review, mentor, viết doc người khác dùng được
- 0.6 Ownership: từ yêu cầu mơ hồ → hệ thống chạy được + vận hành được

---

## L1. JavaScript runtime (nền móng, hay bị hỏi ngược)

- 1.1 Ngôn ngữ: primitives vs object, tham chiếu vs giá trị, `==` vs `===`, coercion
- 1.2 Function & this: call sites, arrow vs method, `bind/call/apply`, closure
- 1.3 Prototype chain: `class` chỉ là syntactic sugar, `Object.create`, inheritance thật
- 1.4 Scope & hoisting: TDZ, IIFE hết thời, module scope
- 1.5 Event loop: call stack → microtask queue (Promise, queueMicrotask) → macrotask (setTimeout, I/O). thứ tự in của `setTimeout vs Promise.resolve vs console.log`
- 1.6 Blocking vs non-blocking: vì sao 1 thread vẫn chịu tải lớn; `process.nextTick` vs microtask
- 1.7 Libuv: thread pool (4 by default) cho fs/DNS/crypto, io_uring/epoll cho network
- 1.8 Async: callback → promise → async/await; error propagation; `Promise.all/allSettled/race/any`; unhandled rejection
- 1.9 Garbage collection: young/old generation, memory leak kinh điển (closure giữ reference, listener quên remove, global cache không eviction)
- 1.10 Structured data: JSON giới hạn (không Date, Map, cycle), structuredClone, bigint
- 1.11 Errors: Error subclass, stack trace, error vs exception flow, `try/finally` semantics

**Check**: giải thích tại sao `await` trong loop for là tuần tự, và khi nào điều đó đúng ý.

---

## L2. TypeScript (senior TS ≠ biết annotation)

- 2.1 Type system: structural vs nominal, assignability, `unknown` vs `any` vs `never`
- 2.2 Narrowing: discriminated union, type predicate (`x is T`), `asserts`, control-flow analysis
- 2.3 Generics: constraints, `extends infer`, conditional types, distributive conditional, `satisfies`
- 2.4 Utility types: `Partial/Pick/Omit/Record/Awaited/ReturnType`; tự viết lại được
- 2.5 Mapped & template literal types: `keyof`, indexed access, `[K in keyof T]`
- 2.6 `strict` đầy đủ: `strictNullChecks`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` — hiểu vì sao từng flag tồn tại
- 2.7 Declaration: interface vs type (khi nào bắt buộc interface: declaration merging, class implements)
- 2.8 Module system: ESM vs CJS, `type: module`, `verbatimModuleSyntax`, dual package hazard, `tsconfig moduleResolution: bundler/node16`
- 2.9 tsconfig layers: `target/lib/module/moduleResolution` tách biệt nhau; project references; incremental build
- 2.10 Type-erasure runtime: enum trap, `typeof`, runtime validation vẫn cần (zod/class-validator)
- 2.11 Declaration files: `.d.ts`, `declare module`, augmentation của lib khác
- 2.12工具的: tsc vs transpile-only (SWC/esbuild) — vì sao type-check không发生在 runtime
- 2.13 Pattern thực chiến: branded types cho DomainId, discriminated union cho state, Result type vs throw

**Check**: viết `DeepPartial<T>`, `Paths<T>` từ đầu không tra.

---

## L3. HTTP & web platform (nơi mọi stack gặp nhau)

- 3.1 HTTP/1.1: method semantics (safe/idempotent), status classes, header, keep-alive, head-of-line blocking
- 3.2 HTTP/2: multiplexing, stream, server push (chết), header compression; HTTP/3 QUIC vì sao
- 3.3 TLS: handshake 1.3 (1-RTT), certificate chain, SNI; vì sao private key không rời server
- 3.4 Cache: `Cache-Control` (max-age, s-maxage, stale-while-revalidate), ETag vs Last-Modified, `Vary`, CDN tier vs browser tier
- 3.5 Content negotiation: `Accept/Content-Type`, multipart/form-data (mode upload của org)
- 3.6 Cookie: SameSite (Lax/Strict/None), Secure, HttpOnly, Domain/Path; vì sao SameSite phá CORS-with-credentials
- 3.7 CORS: preflight khi nào nổ, `Access-Control-Allow-*`, credentials mode; sửa ở edge hay ở app
- 3.8 URL & encoding: `encodeURIComponent` phạm vi, `URL`/`URLSearchParams` API
- 3.9 Streaming: chunked transfer, SSE vs WebSocket vs long-poll — khi nào dùng gì
- 3.10 Range, compression (`Content-Encoding`), ETag yếu vs mạnh

**Check**: giải thích một request ảnh qua CDN thất bại vì `Vary: Cookie` — vì sao cache miss.

---

## L4. Browser & frontend foundations

- 4.1 Critical rendering path: HTML parse → CSSOM → render tree → layout → paint → composite
- 4.2 Reflow vs repaint vs composite; `transform/opacity` tại sao rẻ; `will-change` lạm dụng hại gì
- 4.3 Scripts: `defer` vs `async` vs inline; blocking render; module scripts là defer mặc định
- 4.4 Core Web Vitals: LCP (nguồn gốc: server TTFB, resource load, lazy quá tay), INP (task dài, hydration cost), CLS (thiếu size ảnh, font swap → `font-display`)
- 4.5 Resource loading: `preload/prefetch/preconnect/fetchpriority`, srcset/sizes, `loading=lazy` sai chỗ hại LCP
- 4.6 Storage: localStorage vs IndexedDB vs cookie vs Cache API; giới hạn size; private mode
- 4.7 Accessibility: semantic HTML trước ARIA, focus management, keyboard path, `prefers-reduced-motion`
- 4.8 Security browser: CSP (nonce vs hash vs unsafe-inline), XSS vector, clickjacking (`frame-ancestors`), `target=_blank` noopener
- 4.9 Navigation: history API (React Router dựa vào đây), PRG pattern
- 4.10 Modern APIs đáng biết: View Transitions, container queries, `:has()`, popover, `<dialog>` native, Intl (i18n)

---

## L5. React (trước khi đụng Next.js)

- 5.1 Render model: UI = f(state); reconciliation; key và vị trí; vì sao index-as-key hỏng list có reorder
- 5.2 Fiber: render phase vs commit phase, interruptible rendering, priority
- 5.3 State: `useState` batching, updater function, state không phải biến — là input của render kế tiếp
- 5.4 Effect: cleanup là phần của effect, không phải "componentWillUnmount"; dependency array là contract; Effect dùng cho đồng bộ với hệ thống ngoài, không dùng để "chạy sau render"
- 5.5 Ref: thoát khỏi render model có kiểm soát; `forwardRef` vs ref prop (React 19)
- 5.6 Memoization: `useMemo/useCallback/react.memo` — chỉ thắng khi prop ổn định + render thật sự đắt; đo trước
- 5.7 Context: re-render cả subtree; tách context theo tần suất thay đổi; selector pattern (zustand/jotai thay vì context cho state nhanh)
- 5.8 Suspense & concurrent: lazy, `useTransition`, `useDeferredValue`, `use()` (React 19), activity
- 5.9 Forms: controlled vs uncontrolled, Action pattern (React 19 `useActionState`, `useOptimistic`)
- 5.10 Composition vs props-drilling: children-as-slot, component API design (senior hay bị hỏi ở đây)
- 5.11 Patterns lỗi: derived state trong effect (nên tính lúc render), `useEffect` để fetch dữ liệu server, state duplication
- 5.12 Server components (đọc ở L6): React không còn chỉ là client library

---

## L6. Next.js (App Router làm trung tâm)

- 6.1 Rendering spectrum: SSG / ISR / SSR / CSR / PPR — với mỗi loại: dữ liệu nằm ở đâu, revalidate khi nào, khi nào chọn
- 6.2 App Router: layout tree, nested routing, `loading.tsx`, parallel & intercepting routes, route groups
- 6.3 Server vs Client components: boundary rules, serialization, vì sao Server Component mặc định là mặc định đúng
- 6.4 Server Actions: formAction, `revalidatePath/revalidateTag`, progressive enhancement, security (chúng là public endpoint — validate input như API)
- 6.5 Caching layers: Data Cache, Full Route Cache, Router Cache, `unstable_cache` — và Next 15+ đổi default sang `no-store` semantics. Đây là chỗ 90% dev hiểu sai
- 6.6 Data fetching: fetch vs server component vs route handler; dedupe bằng cache; streaming & Suspense boundary cho TTFB
- 6.7 Middleware: edge runtime, chạy mỗi request, đừng nặng; redirect/rewrite/i18n/locale
- 6.8 `next/image`: resize on-demand vs build, `priority`, loader custom; `next/font`: zero layout shift
- 6.9 Streaming SSR + selective hydration: `next/dynamic` đúng/sai, client boundary và bundle size
- 6.10 Rendering errors: error boundary (global-error, error.tsx), not-found
- 6.11 i18n: `next-intl` pattern, locale routing, message catalog
- 6.12 Deploy: standalone output, edge vs node runtime, ISR trên serverless (cache per-instance → vấn đề gì)
- 6.13 Migration: Pages Router → App Router; `getServerSideProps` tương đương cái gì; vì sao `useSearchParams` cần Suspense

**Check**: vẽ lại đường đi dữ liệu của 1 trang: request → middleware → RSC payload → cache layers → browser.

---

## L7. Node.js runtime (backend)

- 7.1 Process model: event loop 6 phase, thread pool, `worker_threads` (CPU-bound task duy trì 1 loop không được), cluster (process-per-core, IPC qua IPC channel)
- 7.2 Streams: backpressure là lý do duy nhất tồn tại; `pipe` tự xử lý; `pipeline` + error; objectMode; Readable/Web ReadableStream hai hệ
- 7.3 Buffer & typed arrays: encoding, `Buffer.alloc` vs `Buffer.allocUnsafe` (security)
- 7.4 fs: sync vs async vs `fs.promises`; `graceful-fs` hết thời; file watching
- 7.5 Child process: spawn vs exec vs fork, khi nào thoát Node là trả lời đúng
- 7.6 Memory: heap snapshot, `--max-old-space-size`, vì sao OOM trong container khi memory limit của Node > limit cgroup
- 7.7 Worker offload pattern: offload crypto/parse lớn sang worker thread hoặc separate service
- 7.8 Observability runtime: `process.env` anti-pattern đọc mỗi request, `perf_hooks`, async_hooks (basis của Nest request context)
- 7.9 Security runtime: prototype pollution, `Object.freeze`, `process.binding`, dependency exec

---

## L8. NestJS (DI + kiến trúc ứng dụng)

- 8.1 DI: provider lifetime (singleton/request/transient), `forwardRef` là code smell, circular DI thật = module design sai, `@Inject` token, custom provider factory, scope explosion (request-scoped chain toàn bộ upstream thành request-scoped)
- 8.2 Module design: feature vs domain vs infrastructure module; module boundary = public API của 1 bounded context; `exports` là interface; barrel file leak
- 8.3 Layering: controller (transport) / service (use case) / repository (data access) — tách để test, không phải vì book nói vậy; controller không import repository
- 8.4 Request lifecycle: middleware → guards → interceptors → pipes → controller → interceptors(tail) → exception filters — thứ tự đúng và mỗi tầng nên/cấm làm gì
- 8.5 Pipes & validation: class-validator (decorator = runtime metadata) vs zod (schema = source of truth, validate trước DTO); org dùng interceptor upload (mediaUpload inject URL vào body trước validation — nắm để không phá flow)
- 8.6 Guards: auth guard vs permission guard tách nhau, `canActivate` chạy mỗi request (đắt = cache)
- 8.7 Interceptors: response shaping, timeout, logging, cache interceptor; RxJS ở đây có đáng giữ không (Next 15 ecosystem nghiêng về promise)
- 8.8 Exception filter: HttpException vs domain error (Result pattern); error mapping nhất quán, không leak stack
- 8.9 Config: `@nestjs/config` + zod/env validation at boot — fail fast ở startup chứ không ở request đầu tiên
- 8.10 Background work: `@nestjs/schedule`, BullMQ cho job queue, event emitter vs message queue (in-process vs durable)
- 8.11 Database integration: Prisma 7 (org rule), transaction scope, repository vs raw Prisma lộ ra service — trade-off
- 8.12 Auth module: Passport strategy, JWT access+refresh rotation, session vs JWT vs org đã chọn gì
- 8.13 Testing Nest: unit test với mocked provider, e2e với supertest + Test.createTestingModule override provider — boundary giả lập đúng chỗ nào
- 8.14 Performance: keep-alive agent khi gọi service khác, connection pool (DB/redis) vs connection per request, `fastify` adapter trade-off (schema validation, logger)
- 8.15 Monorepo & library boundaries: `packages/` là deep module — export tối thiểu, import qua entrypoint (org rule, hỏi đến là phải trả lời được)

**Check**: thiết kế module "Order" cho 1 team khác dùng lại; giải thích interface của nó nằm ở file nào.

---

## L9. Database (Prisma-first nhưng không chỉ Prisma)

- 9.1 Relational model: 1:N vs M:N (join table), cascade, ON DELETE vs app-level delete; soft delete phá index/unique constraint thế nào
- 9.2 Index: B-tree hoạt động sao, composite index thứ tự cột quan trọng hơn có index, covering index, index write cost, `EXPLAIN` đọc được: Seq Scan vs Index Scan vs Bitmap
- 9.3 Transactions & isolation: 4 level, read committed mặc định, lost update & race condition thường gặp (check-then-insert → unique constraint là fix đúng, không phải app lock)
- 9.4 N+1: phát hiện qua log, fix bằng join/`include`/batch loader; `select` để giảm payload
- 9.5 Connection pool: pool size bao nhiêu là đúng (không phải mỗi request 1 conn), PgBouncer khi serverless
- 9.6 Prisma-specific: PrismaClient singleton (cấm new trong lambda), `transaction` interactive vs atomic, migration workflow, raw query escape hatch
- 9.7 Modeling senior: enum trong DB vs app, money = integer minor unit, decimal vs float, timezone = store UTC + `timestamptz`
- 9.8 Cache-DB consistency: cache invalidation strategy, write-through vs cache-aside, stale accepted khi nào
- 9.9 Search: LIKE không scale → trigram index / tsvector / Meilisearch khi nào
- 9.10 Partitioning & scale-out: khi nào thật sự cần (volume threshold nào), read replica + replication lag
- 9.11 Migrations production: expand-contract pattern (zero-downtime), không bao giờ drop cột trong migration đầu tiên

---

## L10. API design

- 10.1 REST maturity: resource naming, status code semantics thật (201 + Location, 409 conflict, 422 vs 400), pagination (offset vs cursor — vì sao cursor thắng khi có insert), filtering, sparse fieldset
- 10.2 Idempotency: Idempotency-Key header cho payment, retry-safe design
- 10.3 Versioning: URL vs header vs none (additive-first: thêm field không phá client cũ)
- 10.4 Error contract: RFC 7807 (problem+json), error code taxonomy ổn định cho client switch
- 10.5 OpenAPI/type-first: tRPC hoặc `@nestjs/swagger` từ DTO; contract là nguồn sinh docs + client type
- 10.6 GraphQL: khi nào đáng (N client, N frontend team), khi nào không (auth phức tạp, cache, N+1 tự gây); persisted query, DataLoader
- 10.7 File upload: inline multipart qua endpoint business + interceptor (org standard) — vì sao presign-then-PUT là anti-pattern ở đây
- 10.8 Rate limiting: token bucket vs sliding window, theo user vs IP, 429 + `Retry-After`
- 10.9 Webhook (backend gọi lại): HMAC sign, retry + backoff, idempotency phía receiver
- 10.10 Realtime: SSE (one-way) vs WebSocket (bidirectional) — chọn theo chiều dữ liệu, không theo thói quen; Redis pub/sub khi multi-instance
- 10.11 Public API thinking: deprecation policy, changelog, backward compat 2 version

---

## L11. Auth & security

- 11.1 Session vs JWT: vì sao JWT cho web app thường sai (logout, rotation); JWT phù hợp service-to-service, refresh token
- 11.2 OAuth2/OIDC: authorization code + PKCE (public client không có secret), access token ngắn hạn, refresh rotation & reuse detection; scope vs permission
- 11.3 Password: bcrypt/scrypt/argon2 (hash ≠ encrypt), pepper, reset token one-time + expiry
- 11.4 Web top attacks: XSS → CSP, CSRF (SameSite + token), SQL injection (parameterized, ORM không tự miễn nếu raw string), SSRF (validate outbound URL), path traversal (upload filename), prototype pollution
- 11.5 Headers baseline: CSP, HSTS, X-Frame-Options/frame-ancestors, Referrer-Policy, COOP/COEP (chỉ khi cần)
- 11.6 Secrets: env at runtime vs build time (NEXT_PUBLIC_* = public, không phải secret), secret manager, không commit — org audit rule soi cái này
- 11.7 Authz mô hình: RBAC vs ABAC, policy ở guard vs ở service, "confused deputy" khi cho user truyền ID rồi query theo ID (phải filter theo owner)
- 11.8 Supply chain: lockfile, audit, pin version, postinstall script là attack vector

---

## L12. Performance engineering (senior hỏi cách tìm, không phải cách sửa)

- 12.1 Đo trước sửa: profiler, flame graph, A/B measure; không có số = không có claim
- 12.2 Backend: event loop lag metric, pool saturation, GC pause, CPU profile qua `--prof`/clinic
- 12.3 N+1 API-level: một trang gọi 40 endpoint tự gây — fix bằng composition endpoint, không phải client cache
- 12.4 Frontend bundle: code splitting tự nhiên của App Router, `next build --experimental-metrics` / bundle analyzer, tree-shaking fail vì side-effect
- 12.5 TTFB chain: DNS → TLS → TTFB server → streaming; p95 vs median — senior nói p95
- 12.6 Image & media: format, dimension, CDN, lazy đúng chỗ
- 12.7 Caching pyramid: in-memory (per-instance, mất khi scale) → Redis → CDN → browser; mỗi tầng invalidate khác nhau
- 12.8 Queue offload: request phải trả lời trong bao lâu, việc gì cho queue (email, resize, report)
- 12.9 DB: long query log, lock contention, covering index fix được gì và không fix được gì

---

## L13. Testing (kiểm chứng, không phải diễn kịch)

- 13.1 Test pyramid thực dụng: unit nhiều (logic thuần), integration qua boundary thật (DB testcontainers), e2e ít mà sắc (Playwright)
- 13.2 Testable design: dependency injection để thay boundary; code khó test = thiết kế sai, không phải "viết test khó"
- 13.3 Mock đúng chỗ: mock hệ thống ngoài (payment, email), không mock DB (org e2e rule: chạy với API thật); mock-echo test = slop
- 13.4 TDD: dùng cho business rule, state machine, parser — không dùng cho CRUD cơ học
- 13.5 Fix flaky: await condition không await time, test isolation (shared state là nguồn số 1)
- 13.6 Coverage: đo để tìm vùng tối, không phải chạy theo %; value-free test (assert tautology) là vi phạm audit rule
- 13.7 E2E tổ chức: fixtures, auth reuse, chạy song song, screenshot/video khi fail trên CI

---

## L14. DevOps / infra (senior vận hành thứ mình viết)

- 14.1 Container: Dockerfile multi-stage, layer order cho cache, non-root user, image size vì sao quan trọng, cgroup limit → Node memory
- 14.2 CI/CD: pipeline cache deps, build once promote many, preview env per PR (Next Vercel pattern)
- 14.3 Environment: config qua env (12-factor), secret per-env, feature flag tách deploy khỏi release
- 14.4 Observability 3 trụ: log (structured JSON + correlation/request id), metric (RED: rate/errors/duration, USE resource), trace (OpenTelemetry, context propagation qua queue)
- 14.5 Alerting: alert trên symptom (user impact) không phải cause; SLO/error budget
- 14.6 Incident: severity, mitigation trước root cause (rollback là fix), blameless postmortem — interview hỏi bằng behavioral câu hỏi
- 14.7 Deploy safety: zero-downtime (readiness probe, drain), migration + deploy order, canary/blue-green, rollback plan bắt buộc
- 14.8 IaC: Terraform/module/state, K8s khái niệm tối thiểu (deployment, service, ingress, HPA) đủ để tranh luận với DevOps
- 14.9 Cost: khi nào serverless đắt hơn server, DB storage growth, egress
- 14.10 GitHub Actions: reusable workflow, changesets release automation (org standard)

---

## L15. System design (vòng quyết định senior)

- 15.1 Framework: requirement (functional + non-functional: QPS, p99, data size, team size) → ước lượng con số → API → data model → high-level → deep dive theo yêu cầu → bottleneck → trade-off
- 15.2 Estimation: 1 req/s vs 1k vs 100k; storage/ngày; bandwith; 2N+1 replicas
- 15.3 Load balancing: L4 vs L7, algorithm, session affinity vs stateless
- 15.4 Horizontal scaling: stateless app (auth ở token/redis), sticky problem, cache invalidation đa instance
- 15.5 Caching chiến lược: cache-aside, write-through, write-behind, invalidation by tag; thundering herd (single-flight)
- 15.6 Database scale: read replica + lag, sharding (key range/hash/lookup), CQRS tách write model, vì sao 95% bài toán dừng ở "1 Postgres to" là đúng
- 15.7 Async: queue (BullMQ/Kafka/SQS), at-least-once vs exactly-once (exactly-once = idempotency ở consumer), DLQ, outbox pattern (DB write + event atomic)
- 15.8 Rate limit, circuit breaker, bulkhead, backpressure, timeout ở mọi tầng
- 15.9 Real-time hệ: fan-out on write vs on read, presence, pub/sub scale
- 15.10 Bài kinh điển phải làm được: URL shortener, news feed, chat, notification system, design YouTube-lite (upload + transcode pipeline), rate limiter, web crawler, distributed lock (và vì sao lock phân tán nguy hiểm)
- 15.11 Trade-off vocabulary: consistency vs availability, latency vs throughput, build vs buy, monolith vs microservice (và recovery path khi microservice sai)

---

## L16. Architecture & craft (code quality)

- 16.1 Deep module (org rule — packages/): interface nhỏ, implementation ẩn sau entrypoint; depth = value/complexity
- 16.2 Dependency direction: domain không import framework, ports & adapters / hexagonal — khi nào đáng, khi nào over-engineering
- 16.3 DDD chiến thuật: entity vs value object, aggregate boundary, invariant nằm ở aggregate, domain event, anti-corruption layer khi integration legacy
- 16.4 Context map: bounded context cho NestJS module / Next.js feature / package; CONTEXT.md glossary (org đang làm cái này — dùng nó)
- 16.5 Consistency model: transactional (1 DB), saga (multi-service: orchestration vs choreography + compensation), eventual consistency chấp nhận ở đâu
- 16.6 Code smell senior: type-bypass cast (`as`), switch phát tán khắp nơi, shared mutable module state, config cho value không đổi, abstraction 1 implementation (org audit rule = soi đúng cái này)
- 16.7 Refactor chiến thuật: seam để test trước khi refactor, strangler fig khi thay hệ thống
- 16.8 Error design: Result/Either vs exception — boundary: domain return Result, transport throw; không swallow

---

## L17. Leadership & behavioral (vòng senior hay trượt ở đây)

- 17.1 Kể chuyện tech: STAR nhưng có quyết định + số đo ("chọn X thay vì Y vì Z, kết quả giảm 40% p99")
- 17.2 Xung đột kỹ thuật: disagree & commit, cách bạn defend design bằng số
- 17.3 Mentoring: code review mẫu (comment dạy, không chỉ sửa), 1:1 với junior
- 17.4 Ownership sự cố: kể 1 incident bạn cause, bạn phát hiện, bạn fix quy trình
- 17.5 Ước lượng & say no: scope negotiation với PM, nói "không biết" + cách tìm ra
- 17.6 Tech debt: trả khi nào, negotiate với feature, đo bằng interest rate (velocity giảm)

---

## L18. Phỏng vấn cụ thể (skill phỏng vấn, khác năng lực)

- 18.1 Live coding: đọc hết ví dụ → hỏi input edge case → nói hướng trước khi code → chạy test nhỏ → refactor sau khi pass
- 18.2 Hỏi ngược: hỏi traffic, team size, constraint — senior hỏi nhiều hơn trả lời ở giai đoạn đầu
- 18.3 System design whiteboard: quản thời gian 45' (5 req, 5 estimation, 10 API+DB, 15 high-level, 10 deep dive, 5 trade-off)
- 18.4 "Tại sao X": mỗi tool dùng trong dự án phải trả lời được thay thế bằng gì và mất gì
- 18.5 Take-home: đọc test spec trước, commit nhỏ có message, README trade-off, không over-engineer
- 18.6 Behavioural prep: 6 câu chuyện STAR đã có số, mỗi câu cover 1 năng lực L0

---

## Thứ tự học đề xuất (đường chính, đã tối ưu cho gap mid→senior)

1. **L15 System design** — đòn bẩy cao nhất, senior fail ở đây nhiều nhất, và nó ép bạn đi ngược lên mọi tầng khác để giải thích
2. **L8 NestJS depth + L6 Next.js caching/rendering** — đúng stack phỏng vấn, hỏi sâu là lộ ngay học vẹt
3. **L9 Database depth** — index/transaction/race condition là nơi "đã từng dùng" và "hiểu" tách nhau
4. **L15 bài kinh điển ×6** — mỗi bài 1 lần viết ra giấy, tự thuyết trình 30'
5. **L17 behavioral + L18** — 2 buổi tối, không cần học dài
6. Các tầng còn lại: học bị động theo chiều ngược — khi system design/L8/L9 chạm tới unit nào, về unit đó đọc sâu (bottom-up reinforcement)

Học song song: 1 unit "build" (code thật có trade-off) + 1 unit "explain" (viết blog/nói cho ai đó). Đây là câu trả lời Q7/Q8/Q10 của bạn nếu bạn build theo cách đó.

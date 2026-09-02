# L14 — DevOps / infra

## 14.1 Container

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./            # layer riêng: không đổi deps → cache ăn được
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine              # image chạy: KHÔNG có devDeps, không có source
USER node                        # non-root
COPY --from=build /app/dist /app
CMD ["node", "main.js"]          # exec form: PID 1 nhận SIGTERM → graceful shutdown
```
cgroup: `NODE_OPTIONS=--max-old-space-size` khớp limit (L7.6). Healthcheck: `/healthz` nhẹ, không query DB (health check phụ thuộc DB = báo động nhầm khi DB chậm).

## 14.2 CI/CD

Pipeline chuẩn: `lint + typecheck → unit → build (1 lần) → integration → e2e → push image (promote cùng image qua các env)`.
Build once, deploy the same artifact — không "build lại ở staging".
Preview env per PR (pattern Vercel): mỗi PR 1 URL, data dev DB.

```yaml
# cache đúng cách: key theo lockfile
- uses: actions/setup-node@v4
  with: { node-version: 22, cache: npm }
```

## 14.3 Environment & flags

12-factor: config = env, secret = secret manager. Feature flag tách DEPLOY khỏi RELEASE: code lên prod tối nay, bật cho 5% user sáng mai, tắt không cần rollback (org: kill-switch cho tính năng rủi ro).

## 14.4 Observability 3 trụ

```jsonc
// LOG: structured + correlation id xuyên hệ thống
{"level":"warn","msg":"payment failed","reqId":"abc","userId":"u1","code":"GATEWAY_TIMEOUT","durationMs":1523}
```
- METRIC: RED (Rate, Errors, Duration) per endpoint + USE per resource (CPU/mem/pool saturation)
- TRACE: OpenTelemetry, cùng `traceId` xuyên Nest → queue → worker → Next
`reqId` ở header `x-request-id` → sinh/tại edge, propagate mọi tầng — dashboard search 1 reqId ra toàn cảnh.

## 14.5 Alerting & SLO

Alert trên SYMPTOM: "p95 latency > 500ms trong 5p", "error rate > 1%", "checkout success < 99%".
KHÔNG alert trên cause: "CPU 90%" (CPU cao mà user không sao = không page).
SLO 99.9%/tháng = 43 phút error budget — hết budget = lockdown tính năng mới, trả reliability. Nói được câu này trong phỏng vấn = senior signal mạnh.

## 14.6 Incident

Thứ tự: detect → declare (gọi người, chỉ huy 1 người) → MITIGATE (rollback / feature-flag off / scale — chưa cần biết vì sao) → thông báo → sau đó mới root cause → blameless postmortem: "system cho phép lỗi đó xảy ra", không phải "ai gõ lỗi".

## 14.7 Deploy an toàn

- readiness probe: container chỉ nhận traffic khi app listen xong; drain connection cũ khi scale down
- Migration trước code (expand-contract L9.11) — deploy code đọc cột mới SAU khi cột tồn tại
- Canary 5% → xem metric RED 10' → promote; rollback = redeploy image cũ (đã có sẵn = không build vội)

## 14.8 K8s/Terraform tối thiểu để tranh luận

K8s: Deployment (N replica + rollout), Service (stable IP trước pods), Ingress (L7 route), HPA (auto-scale theo CPU/RPS), ConfigMap/Secret. Biết vì sao "pod CrashLoopBackOff" ≠ app sai (probe/limit/env).
Terraform: module = hàm có input/output, state = source of truth (lock khi team), `plan` trước `apply`, không sửa tay resource có trong state.

## 14.9 Cost

Serverless đắt khi: baseline traffic cao đều (trả cho mỗi ms liên tục) → server/containers rẻ hơn. Rẻ khi: traffic trồi thất thường.
Egress (data ra ngoài cloud) là hóa đơn bất ngờ số 1. DB storage: log/table sự kiện → partition + TTL delete.

## 14.10 GitHub Actions (org standard)

Reusable workflow: `uses: ./.github/workflows/build-test.yml` gọi từ CI/release/deploy (rule org: DRY). `/autofix`, `/ecosystem-ci` comment-triggered, gated permission (org rule). changesets/action release lib tự động khi merge.

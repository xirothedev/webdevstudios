# Bài 6 — CI/CD: OIDC, blue/green, rollback

**Mục tiêu:** đọc được `cd.yml` và CodeDeploy console như đọc truyện.

## Pipeline của một tag `v1.2.3`

```
tag → build+push 5 image (api, web, api-go, api-axum, api-elysia) → ECR
    → GitHub environment `production` (chờ người bấm Review)
    → OIDC assume webdev-deploy-production
    → cdk deploy --all (network/oidc/waf/prod/lab)
    → CodeDeploy tạo green task set từ image tag mới
       canary 10% → chờ 5 phút → tăng dần; blue terminate sau 5 phút
```

## Khái niệm

- **Blue/green ECS**: CodeDeploy dựng task set thứ hai (green) với image/tag mới, đổi **weight** trên ALB listener rule — không có moment nào mà 0 target.
- **Health gate thật**: nếu target mới fail liveness (`200-404` matcher, `task.ts`), weight không tăng → deployment đỏ → rollback tự bật (`autoRollback`).
- **Rollback = redeploy tag cũ**: `cdk deploy Prod -c tag=v1.2.2` chạy lại, hoặc GitHub re-run workflow — không có lệnh thần kỳ riêng.
- **image tag = git ref**, không bao giờ `latest` trong task đang chạy (cdk nhận `-c tag=<ref>` từ CI).

## Console

1. CodeDeploy → Applications → 2 app (api, web) → Deployments → xem traffic shift % theo thời gian.
2. GitHub Actions → job deploy → step "Deploy CDK stacks" → xem diff `cdk diff` trong log.
3. Thử rollback: re-run workflow cũ tag trước → quan sát green mới trở về.

## Tự kiểm tra

Vì sao prod dùng 2 ALB (api, web) chứ không 1 ALB 2 rule? (CodeDeploy cần listener riêng cho mỗi app blue/green; 2 ALB rẻ hơn 1 buổi tối oncall.)

# Bài 1 — Tài khoản AWS và bootstrap

**Mục tiêu:** hiểu OIDC role là gì, vì sao không lưu AWS key trong GitHub, và vì sao `cdk bootstrap` chạy một lần.

## Khái niệm

- **IAM role vs user**: role = danh tính tạm, ai assume thì lấy credential trong 1 giờ. Không có password, không có key để rò.
- **GitHub OIDC**: GitHub Actions ký một JWT (`token.actions.githubusercontent.com`) nói "tao đến từ repo X, environment Y". AWS xác minh JWT và cho assume role nếu điều kiện trùng.
- **cdk bootstrap**: tạo 2 bucket (assets + file cache) + 1 ECR repo + 1 SSM param mà `cdk deploy` dùng để chuyển file Docker/asset lên account. Một lần duy nhất.

## Console (đọc hiểu, KHÔNG bấm tạo)

1. IAM → Identity providers → thấy `token.actions.githubusercontent.com`.
2. IAM → Roles → `webdev-deploy-production` → Trust relationships: điều kiện `StringLike` `...:sub: repo:xirothedev/webdevstudios:environment:production`. Environment GitHub khớp mới assume được → GitHub environment approval là tường lửa thật.
3. so với trust policy trong `infra/lib/oidc-stack.ts`.

## Command

```bash
# region ap-southeast-1
cdk bootstrap aws://<account>/ap-southeast-1   # chạy 1 lần, từ laptop đã cấu hình AWS profile
```

## Tự kiểm tra

Không có `AWS_ACCESS_KEY_ID` nào trong GitHub secrets — chỉ có `AWS_ACCOUNT_ID` (variable, không bí mật). Đúng hay sai? (Đúng — account ID không phải secret; key thì không tồn tại.)

# learn/aws — AWS production curriculum

Học AWS trong khi dựng hạ tầng thật cho repo này. Mỗi bài: **đọc → làm trên console → đọc code CDK tương ứng**. Code trong `infra/` là đáp án; đừng mở trước khi tự làm phần console.

## Thứ tự

| # | Bài | Hạ tầng thật tương ứng |
| - | --- | ---------------------- |
| 0 | [localstack/README.md](./localstack/README.md) — AWS giả lập trên xiroserver-lan | `scripts/localstack/` |
| 1 | [01-account-and-bootstrap.md](./01-account-and-bootstrap.md) | account, OIDC role, `cdk bootstrap` |
| 2 | [02-network-and-dns.md](./02-network-and-dns.md) | `infra/lib/network-stack.ts` |
| 3 | [03-ecs-and-services.md](./03-ecs-and-services.md) | `infra/lib/prod-stack.ts`, `lab-stack.ts` (ECS) |
| 4 | [04-data-plane.md](./04-data-plane.md) | RDS, ElastiCache, Secrets Manager |
| 5 | [05-edge-cloudfront-waf.md](./05-edge-cloudfront-waf.md) | `waf-stack.ts`, CloudFront |
| 6 | [06-cicd-oidc-blue-green.md](./06-cicd-oidc-blue-green.md) | `.github/workflows/cd.yml`, CodeDeploy |

## Human-only steps (không có tool nào làm thay)

- [ ] Tạo AWS account; bật MFA cho root; đặt billing alert.
- [ ] Trong GitHub repo settings: add **variable** `AWS_ACCOUNT_ID`; add **secret** `ALERT_EMAIL` (email nhận budget alarm — xác nhận email SNS sau khi deploy).
- [ ] Trong GitHub environments: tạo `production`, bật **Required reviewers** (cổng approval trước khi deploy prod).
- [ ] Trong Cloudflare zone `resonance.io.vn`: tạo record NS `webdevstudio` trỏ 4 nameserver của Route 53 zone (lấy từ console hoặc `aws route53 list-hosted-zones`).
- [ ] Lần đầu, trước tag đầu tiên: `cdk bootstrap` rồi `bun run --cwd infra cdk deploy --all` từ laptop (ECR repo phải tồn tại trước khi CI push image).
- [ ] Sau deploy đầu: điền giá trị thật cho secret `webdev/prod/app` và `webdev/lab/app` trong Secrets Manager (keys = `infra/lib/config.ts`).
- [ ] Resend: verify domain `webdevstudio.resonance.io.vn`, tạo API key → đặt `MAIL_HOST=smtp.resend.com`, `MAIL_PORT=465`, `MAIL_USER=resend`, `MAIL_PASS=<api key>`.
- [ ] PayOS: cập nhật return/cancel webhook URL = `https://api.webdevstudio.resonance.io.vn/...` trong dashboard PayOS (sandbox cho lab, live cho prod).
- [ ] OAuth Google/GitHub: thêm redirect URIs `https://api.webdevstudio.resonance.io.vn/auth/callback/...`.
- [ ] Google OAuth/Resend đều cần DNS lan — chờ NS propagate (`dig NS webdevstudio.resonance.io.vn`).

## Chi phí trần đã chốt (ADR-0007)

Budget alarm $100/tháng (ACTUAL, email). Multi-AZ RDS + 2 NAT có thể bật/tắt qua context `natGateways` trong `infra/cdk.json`.

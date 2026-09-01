# Bài 5 — Edge: CloudFront, WAF, Route 53

**Mục tiêu:** đi hết một request từ trình duyệt tới task và ngược lại.

## Đường đi của `GET https://webdevstudio.resonance.io.vn/`

```
DNS: Route 53 alias record → CloudFront distribution (web)
CloudFront: viewer-request function (SPA rewrite) → cache miss → origin = ALB (https)
ALB (443): host-header rule → target group blue → Fargate task:3000
Response về lại user, ttl 0 (không cache trang động)
```

## Khái niệm

- **WAF scope=CLOUDFRONT bắt buộc ở us-east-1** — vì sao `WafStack` region khác stack khác. Cert CloudFront cũng vậy (ACM for CloudFront = us-east-1).
- **Rule đang chạy**: AWSManagedRulesCommonRuleSet (SQLi/XSS), IpReputationList, rate 2000 req/5 phút/IP. `overrideAction: none` = thật sự block.
- **Ttl 0 + cookie all** = không cache có điều kiện sai; cache static của web-vue dùng managed `CACHING_OPTIMIZED` (1 năm, immutable under /assets/ do vite hash).
- **ALB open 0.0.0.0/0**: nâng cấp = bó buộc ALB ingest vào CloudFront managed prefix list (id đổi theo region — ponytail note trong prod-stack).

## Console

1. CloudFront → 3 distributions (web, api, vue). Behavior của api: forwarded headers all, cookie all, ttl 0.
2. WAF & Shield → Web ACL → rule nào đang count/block? xem sample.
3. Route 53 → record `webdevstudio...` type A alias CloudFront — so với `dig +short webdevstudio.resonance.io.vn` (phải ra Dxxxxx.cloudfront.net).

## Tự kiểm tra

Web-vue deploy thế nào mà không có container nào? (CI build dist → cdk synth thành S3 asset → BucketDeployment upload + invalidation `/`*.)

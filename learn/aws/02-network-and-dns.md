# Bài 2 — VPC, subnet, DNS delegation

**Mục tiêu:** đọc được sơ đồ network-stack và giải thích vì sao Fargate task chạy ở private subnet.

## Khái niệm

- **VPC = mạng riêng trong AWS.** 3 AZ vì prod cần trải tài nguyên qua 3 datacenter.
- **Public subnet**: có Internet Gateway — chỉ ALB/NAT sống ở đây.
- **Private subnet (WITH_EGRESS)**: không có đường vào từ internet; muốn ra ngoài (kéo image từ ECR, gọi R2/Resend) phải đi qua **NAT gateway**. NAT là lý do nó đắt (~$32/tháng/chiếc) — context `natGateways` trong `infra/cdk.json`.
- **Flow logs**: ghi lại mọi luồng đi trong VPC vào CloudWatch Logs — bằng chứng điều tra khi có sự cố.
- **DNS delegation**: zone `webdevstudio.resonance.io.vn` nằm trong Route 53; Cloudflare (zone mẹ) chỉ giữ 4 record NS trỏ sang. Route 53 trả lời mọi query con.

## Console

1. VPC → Your VPCs → `webdev-network` → Subnets: đếm public/private, xem route table nào trỏ IGW, cái nào trỏ NAT.
2. Route 53 → Hosted zones → `webdevstudio.resonance.io.vn` → ghi 4 NS. So với Cloudflare: record NS `webdevstudio`.
3. Certificate Manager → cert `*.webdevstudio.resonance.io.vn` (region ap-southeast-1) → **DNS validation** = Route 53 tự tạo record TXT, tự gia hạn.

## Code

`infra/lib/network-stack.ts` — mỗi dòng map đúng một mục trên.

## Tự kiểm tra

Vì sao task ECS không được đặt ở public subnet? (Không có lý do an ninh nào để nó nhận kết nối vào; ra ngoài vẫn có NAT.)

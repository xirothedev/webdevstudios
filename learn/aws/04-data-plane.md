# Bài 4 — Data plane: RDS, ElastiCache, Secrets Manager

**Mục tiêu:** hiểu vì sao DB không có IP công khai, và password đi từ Secrets Manager vào container như thế nào.

## Khái niệm

- **RDS Multi-AZ standby**: replica ở AZ khác, dữ liệu replicate đồng bộ; failover DNS trỏ sang replica trong ~1-2 phút. PITR: snapshot ngày + WAL log → restore về bất kỳ giây nào trong 7 ngày.
- **Security group là firewall**: `DbSg` chỉ cho 5432 từ CIDR của VPC. Không có ingress từ `0.0.0.0/0`, DB không có public IP.
- **Secret JSON**: CDK sinh secret dạng `{username, password, host, port, dbname}`. `DATABASE_URL` của app nối bằng **dynamic reference** `{{resolve:secretsmanager:...}}` — CloudFormation không thấy plaintext.
- **ElastiCache Redis 7.1**: prod = ReplicationGroup 2 node + automatic failover; lab = 1 node thường. Redis chỉ để rate-limit/cache — failover mất cache, chấp nhận được.

## Console

1. RDS → Databases → `webdevstudios` (prod): Multi-AZ = "standby in a different Availability Zone"; Backups: retention 7.
2. Durability = 2: mỗi tầng (RDS Multi-AZ, Redis 2 node, ECS 2 task, 3 AZ) chết một vẫn còn đường.
3. Secrets Manager → `webdev/prod/app` → edit JSON — đây là chỗ duy nhất mật khẩu sống.

## Code

`prod-stack.ts`: `DatabaseInstance`, `CfnReplicationGroup`, `AppSecret`, chuỗi `dbUrl`.

## Tự kiểm tra

Muốn xoá stack prod, lệnh `cdk destroy` sẽ thành công hay fail? Vì sao? (Fail — deletionProtection + RETAIN removal policy chặn; phải tắt bảo vệ tay trước. Đúng chủ đích.)

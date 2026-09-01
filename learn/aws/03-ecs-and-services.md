# Bài 3 — ECS Fargate: service, task, scaling

**Mục tiêu:** giải thích được vì sao mỗi app là một ECS service và vì sao lab sleep đêm.

## Khái niệm

- **Task definition** = bản thiết kế container (image, env, secrets, cpu/ram). **Service** = "giữ N task sống" + gắn vào target group.
- **Fargate**: không có EC2 để quản; trả tiền theo giây cho cpu/ram thực chạy. Task ở private subnet, IP riêng (awsvpc mode) → health check trực tiếp từng task.
- **Secrets vs environment**: giá trị bí mật không nằm trong template CloudFormation (`secrets:` tham chiếu Secrets Manager, ECS tự chèn lúc start).
- **Scale to zero (lab)**: `ScheduledActions` trong ScalableTarget hạ min=max=0 lúc 23:00 ICT, dựng lại 07:00. Không có request nào "gọi dậy" Fargate — lab không phải serverless, nó là lịch.

## Console

1. ECS → Clusters → webdev-prod: 2 service, mỗi service desired 2/2 tasks RUNNING.
2. Nhấn vào 1 task → xem Network: ENI private IP, security group.
3. ECS → webdev-lab → Service api-go → Auto scaling tab: 2 scheduled actions (Wake/Sleep).
4. CloudWatch → Log groups → `/ecs/api/...`: log thật từ app.

## Code

`infra/lib/prod-stack.ts` (`blueGreen()`), `infra/lib/lab-stack.ts` (vòng lặp mirrors).

## Tự kiểm tra

Vì sao lab không đặt container healthCheck? (Image distroless không có wget/curl — chỉ ALB check được.)

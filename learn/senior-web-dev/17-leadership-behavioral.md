# L17 — Leadership & behavioral

## 17.1 Công thức kể chuyện tech (STAR + quyết định + số)

Cấu trúc mỗi câu ≤ 2 phút:
```
S: "Checkout p99 4s, tỉ lệ fail 2% giờ cao điểm."
T: "Em owning dịch vụ payment, 3 tuần tới Tết."
A: "Profile flame graph → N+1 query trong auth middleware gọi DB mỗi request. Chọn cache session Redis + guard chỉ đọc cache, đổi lại: revocation chậm 60s — thống nhất với team security vì window 60s chấp nhận được."
R: "p95 4.2s → 380ms, fail rate 0.3%. Runbook + dashboard RED cho oncall."
```
Chữ A phải có: lựa chọn + từ chối phương án nào + vì sao + số đo. Không có số = không có câu chuyện.

## 17.2 Xung đột kỹ thuật

Ví dụ mẫu: "Team muốn microservice cho tính năng mới, em phản đối."
→ không kể "em đúng": kể bạn đưa tiêu chí (team size, deploy độc lập không, data coupling), demo chi phí (2 tuần infra để đổi 1 module), chốt pilot modular monolith với module boundary enforce bằng dependency-cruiser, sau 6 tháng tách được thật khi cần. Kết: disagree & commit, ship both ways an toàn.

## 17.3 Mentoring

- code review: comment vào code, không vào người; giải thích NGUYÊN TẮC + dẫn link rule/docs; đánh dấu loại nào là *blocking* vs *suggestion* (junior không đoán được comment nào bắt buộc sửa)
- 1:1 junior: hỏi "chỗ nào blocker" + "muốn học gì", không phải "tiến độ tới đâu"
- doc: viết runbook để người KHÁC vận hành được = bạn không bị oncall mãi

## 17.4 Incident ownership (câu hỏi gần như chắc chắn có)

Kể 1 sự cố bạn gây ra hoặc cứu. Điểm cộng: phát hiện trước khách hàng (alert), mitigation nhanh (flag off), sau đó FIX QUY TRÌNH (thêm CI check, đổi template), không đổ người.

## 17.5 Estimate & say no

- "Em estimate 5 ngày, sai số ±30%. Rủi ro chính: API đối tác chưa có sandbox. Siết được khi spike 1 ngày trước."
- Say no + alternative: "Làm đủ 100% tính năng này cần 6 tuần. Trong 3 tuần: 80% giá trị, bỏ phần X (chưa ai dùng nhiều). Chọn?"
- "Không biết": "Em chưa chạy Postgres ở scale đó. Nguyên tắc em dùng là X, nhưng cần benchmark thật trước khi chốt." — nói sớm trong interview, không nói ở production.

## 17.6 Tech debt

Định nghĩa đo được: velocity giảm, bug cùng 1 module lặp, thời gian onboarding tăng.
Chiến thuật trả: tax 10–20% mỗi sprint, opportunistic (sửa module nào thì dọn module đó), không "sprint dọn dẹp toàn hệ thống" (PM sẽ không duyệt, đúng thôi).
Nghệ thuật negotiate: "Nếu không trả nợ chỗ này, quý sau mỗi feature +40% thời gian. Bằng chứng: commit history module X."

# L18 — Kỹ năng phỏng vấn (skill riêng, khác năng lực)

## 18.1 Live coding — quy trình 6 bước

```
1. Đọc hết đề + ví dụ. Nói ra input/output bạn hiểu — confirm với interviewer (bắt edge case ở đây)
2. Hỏi: dữ liệu cỡ nào? đã sorted? trùng lặp? unicode? (câu hỏi đúng = điểm, không phải yếu)
3. Nói hướng đi trước khi code, 30 giây. Được gật → code.
4. Code phần chính trước, edge sau. Chạy/test tay 1 case thường + 1 case biên
5. Nếu stuck: nói to suy nghĩ, liệt kê ứng viên — interviewer help người nói ra hướng, không help người im lặng
6. Pass rồi mới hỏi: "em refactor tách hàm được không?" — làm gọn, không làm lại từ đầu
```
Anti-pattern: code luôn không hỏi (giả định sai → sửa cả bài), hoặc xin hint mỗi 2 phút không tự thử gì.

## 18.2 Hỏi ngược — senior hỏi nhiều hơn nói

Đầu system design: "dữ liệu nào đọc nhiều nhất?", "team hiện tại mấy người vận hành cái này?", "có ràng buộc stack nào không?"
Cuối văn hoá: "quyết định kỹ thuật gần nhất nào team đổi vì phản biện của một người?" — câu trả lời lộ maturity team thật, và bạn đang audit họ.

## 18.3 Đồng hồ system design 45'

```
0-5   requirement + chỉ tiêu
5-10  estimation, chốt con số quyết định
10-15 API + data model (viết gọn, đừng vẽ đẹp)
15-25 high-level diagram — XIN interviewer xác nhận trước khi deep dive ("em đi sâu vào cache được không?")
25-35 deep dive — thành phần interviewer chỉ
35-40 bottleneck + kế hoạch scale bậc tiếp
40-45 TÓM TẮT trade-off — bước này hay bị hết giờ, luyện để còn 5'
```

## 18.4 Chuỗi "tại sao X" — luyện với từng tool bạn dùng

Mỗi tool phải trả lời 3 tầng:
```
"Sao dùng BullMQ mà không Kafka?"  → quy mô msg/s + org đã có Redis
"Sao không RabbitMQ?"             → chưa cần routing phức tạp
"Sau này thay được không?"        → interface ở application layer, producer/consumer tách qua message schema
```
Tool nào trả lời tầng 3 bí → về đọc lại tầng tương ứng (L14/L15).

## 18.5 Take-home

```
trước khi code: đọc test spec (nếu có), viết README stub: phạm vi, trade-off chọn, cái gì bạn CỐ Ý bỏ
trong khi: commit nhỏ, message "why"; không commit file rác
nộp: 3 phần README = ① cách chạy ② quyết định + đánh đổi ③ "nếu có thêm 1 ngày em sẽ..." (bước này người ta chấm senior rất nặng)
không over-engineer: không Docker+K8s cho 1 CRUD API
```

## 18.6 Chuẩn bị 6 câu chuyện STAR

Mỗi câu ≥ 1 số đo, cover: ① incident ownership ② trade-off technical ③ xung đột & commit ④ mentoring ⑤ deadline negotiation ⑥ học cái mới từ số 0.
Viết ra giấy, tập nói 2 phút/câu, tiếng Việt trước rồi tiếng Anh (đừng học thuộc — nắm khung 17.1).

**Check cuối cùng:** mock interview 45' system design với đồng hồ thật + ghi âm, tự chấm theo 15.1: đủ 7 bước chưa, bao nhiêu câu "vì… đổi lại…".

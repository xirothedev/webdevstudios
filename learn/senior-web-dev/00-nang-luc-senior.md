# L0 — Mô hình năng lực senior (thang đo)

Dùng file này để tự chấm. Chấm 0–3: 0 = chưa biết, 1 = từng dùng, 2 = giải thích được, 3 = từng dạy lại cho người khác.

## 0.1 Kỹ thuật: sâu một stack, rộng mọi tầng

Định nghĩa: với NestJS/Next.js/TS, bạn trả lời được "cái này hoạt động thế nào" ở mọi tầng (runtime → HTTP → DB). Không cần expert mọi thứ, cần không im lặng ở tầng nào.

Ví dụ tự test — chuỗi câu hỏi xuyên tầng:
```
"Câu await fetch() trong service Nest chạy ở đâu?"
→ TS: promise suspension      (L2)
→ Node: microtask queue       (L1)
→ HTTP: keep-alive socket     (L3)
→ Prisma: pool connection     (L9)
```
Trả lời được cả 4 = đạt 0.1.

## 0.2 Phán đoán trade-off

Định nghĩa: mỗi lựa chọn kỹ thuật nói được 2 cột: được gì / mất gì.

Ví dụ: JWT vs session
| | JWT | Session |
|---|---|---|
| Được | không cần lookup mỗi request | logout tức thì, revocation dễ |
| Mất | thu hồi khó (phải blacklist) | 1 round-trip Redis mỗi request |
Senior kết luận bằng ngữ cảnh: "internal tool, logout gấp → session. Mobile stateless → JWT + refresh rotation."

## 0.3 Hệ quả dài hạn

Định nghĩa: thấy quyết định hôm nay ở điểm 12–24 tháng.

Ví dụ: chọn `enum` trong Postgres:
- hôm nay: sạch, rẻ
- 1 năm sau: thêm giá trị = migration lock table lớn, rollback migration khó
- hệ quả: nhiều team chốt "enum ở app layer + check constraint" — quyết định dựa trên chi phí tương lai, không phải sự tiện hôm nay.

## 0.4 Communicate risk

Ba câu senior phải nói được và nói sớm:
1. "Con số này là estimate, sai số ±30%, em cần thêm X để siết lại."
2. "Em chưa làm cái này bao giờ. Em ước lượng dựa trên Y, nhưng cần người review."
3. "Cái này nổ to nếu Q tăng gấp 10. Đề xuất chặn bằng rate limit trước, refactor sau."

Ví dụ anti-pattern (mid hay làm): im lặng nhận deadline → 2 tuần trước release mới báo trễ. Senior báo rủi ro ở ngày thứ 2.

## 0.5 Nâng người khác

Đơn vị đo không phải "em giúp được nhiều người" mà là "codebase dễ vào hơn cho người sau".

Ví dụ review comment:
- ❌ mid: "Sai rồi, sửa đi."
- ✅ senior: "Guard này chạy DB query mỗi request cho route public. Route /health bị chậm theo. Đề xuất: bỏ guard khỏi public route, hoặc cache 60s.case."
Kèm: ADR + CONTEXT.md glossary (org bạn đang làm sẵn — dùng nó làm công cụ).

## 0.6 Ownership

Định nghĩa: vào = yêu cầu mơ hồ ("khách phàn nàn trang chậm"), ra = hệ thống chạy + có dashboard + có alert + có doc + người khác vận hành được không cần bạn.

Ví dụ checklist tự chấm cho 1 feature bạn đã làm:
- [ ] đo được effect bằng metric trước/sau
- [ ] có alert khi nó hỏng
- [ ] có runbook 10 dòng cho người khác oncall
- [ ] viết ADR cho quyết định không hiển nhiên

4/4 = 0.6 đạt.

---
Tự chấm xong: gửi kết quả cho tôi, tôi cắt bớt các tầng đã ≥2 trong LEARNING-PATH.

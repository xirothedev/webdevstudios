## Trạng thái hiện tại của dự án

- Monorepo `webdevtudios-fullstack-turborepo` với app web sử dụng Next.js (App Router), Tailwind CSS, motion/react và Next Image cho phần landing page / shop.
- `FeaturesGrid` trên trang web hiển thị 4 sản phẩm merch WebDev Studios: áo thun, huy hiệu, dây đeo (lanyard) và pad chuột limited, với hiệu ứng glassmorphism và animation 3D nhẹ.

## Những gì đã đạt được trong session này

- Tăng kích thước block ảnh sản phẩm áo thun WDS trong `FeaturesGrid` theo style hero, đồng thời tăng hiệu ứng hover (scale, dịch trục Y, nhẹ rotate) và làm mạnh glow/shadow để nổi bật hơn.
- Chỉnh ảnh dây đeo (`/shop/day-deo.webp`) trong card Túi & Balo thành full-width, tỉ lệ ngang rõ ràng hơn, hover nhẹ nhàng để người dùng xem preview chi tiết.
- Cập nhật lại tiêu đề và mô tả các card để khớp với tên file ảnh/vật phẩm:
  - Huy hiệu WebDev Studios (`huy-hieu.webp`)
  - Dây đeo WebDev Studios (`day-deo.webp`)
  - Pad chuột WebDev Studios Limited Edition (`pad-chuot.webp`)

## Next steps cụ thể

- Kiểm tra responsive trên các breakpoint (mobile, tablet, desktop) để đảm bảo block ảnh không tràn layout và vẫn cân đối với các card còn lại.
- Nếu cần, tinh chỉnh lại `h/w` ở `motion.div` ảnh áo thun và ảnh dây đeo để phù hợp với thiết kế thực tế và các asset khác.
- Chạy `pnpm lint` và `pnpm format` ở root monorepo để đảm bảo code style thống nhất.

## Known bugs / edge cases

- Chưa kiểm tra thực tế trên màn hình rất nhỏ (<360px) hoặc rất rộng (>1600px); có thể cần tinh chỉnh thêm class Tailwind cho các breakpoint đó nếu layout bị lệch.

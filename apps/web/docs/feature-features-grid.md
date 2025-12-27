## Feature: FeaturesGrid (Bộ sưu tập merch WebDev Studios)

### Mô tả

`FeaturesGrid` là section giới thiệu các sản phẩm merch với phong cách glassmorphism + 3D parallax trên trang web:

- Áo thun WebDev Studios (`ao-thun.webp`)
- Huy hiệu WebDev Studios (`huy-hieu.webp`)
- Dây đeo WebDev Studios (`day-deo.webp`)
- Pad chuột WebDev Studios Limited Edition (`pad-chuot.webp`)

### Chi tiết UI/UX

- Glass card với border mờ, backdrop-blur, gradient overlay và shimmer.
- Sử dụng `motion/react` cho hiệu ứng:
  - Tilt 3D nhẹ theo vị trí chuột (GlassCard wrapper).
  - Hover scale / translate Y / rotate cho các block ảnh sản phẩm.
- Ảnh sản phẩm sử dụng `next/image` với `fill` để tối ưu và giữ tỉ lệ đẹp.

### Thay đổi trong session này

- Tăng kích thước block ảnh hero cho áo thun WDS:
  - Thay `h-52 w-72` thành kích thước lớn hơn, responsive theo breakpoint (`h-60 w-80`, `md:h-72 md:w-104`, `lg:h-80 lg:w-120`).
  - Hover mạnh hơn: `scale: 1.12`, `y: -16`, `rotate: -2`, tăng `translateZ` để cảm giác nổi hơn.
  - Tăng cường glow/background gradient và drop-shadow để ảnh nổi bật so với nền.
- Cập nhật alignment giữa ảnh và nội dung:
  - Card Huy hiệu WebDev Studios: tiêu đề & mô tả mô tả đúng huy hiệu (`huy-hieu.webp`).
  - Card Dây đeo WebDev Studios: tiêu đề & mô tả mô tả đúng dây đeo/lanyard (`day-deo.webp`), ảnh full-width để preview rõ.
  - Card Pad chuột WebDev Studios Limited Edition: tiêu đề mô tả đúng pad chuột limited (`pad-chuot.webp`).

### File liên quan

- `apps/web/src/components/FeaturesGrid.tsx`

### Env vars

- Feature này không yêu cầu env var riêng. Không có thay đổi mới cho `.env.example`.

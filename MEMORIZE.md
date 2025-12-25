## Trạng thái hiện tại của dự án

- Monorepo `webdevtudios-fullstack-turborepo` với app web sử dụng Next.js (App Router), Tailwind CSS, motion/react và Next Image cho phần landing page / shop.
- `FeaturesGrid` trên trang web hiển thị 4 sản phẩm merch WebDev Studios: áo thun, huy hiệu, dây đeo (lanyard) và pad chuột limited, với hiệu ứng glassmorphism và animation 3D nhẹ.

## Những gì đã đạt được trong session này

### Frontend (Previous)

- Tăng kích thước block ảnh sản phẩm áo thun WDS trong `FeaturesGrid` theo style hero, đồng thời tăng hiệu ứng hover (scale, dịch trục Y, nhẹ rotate) và làm mạnh glow/shadow để nổi bật hơn.
- Chỉnh ảnh dây đeo (`/shop/day-deo.webp`) trong card Túi & Balo thành full-width, tỉ lệ ngang rõ ràng hơn, hover nhẹ nhàng để người dùng xem preview chi tiết.
- Cập nhật lại tiêu đề và mô tả các card để khớp với tên file ảnh/vật phẩm:
  - Huy hiệu WebDev Studios (`huy-hieu.webp`)
  - Dây đeo WebDev Studios (`day-deo.webp`)
  - Pad chuột WebDev Studios Limited Edition (`pad-chuot.webp`)

### Backend - Cloudflare R2 Storage Integration

- **Tích hợp Cloudflare R2 Storage**: Tạo module storage hoàn chỉnh với AWS SDK v3 (S3-compatible API)
- **Storage Module** (`apps/api/src/storage/`):
  - `storage.service.ts`: Service xử lý upload/download/delete với R2
  - `storage.config.ts`: Configuration cho R2 credentials
  - `storage.module.ts`: NestJS module
  - `exceptions/`: Custom exceptions (FileTooLargeException, InvalidFileTypeException, ImageProcessingException, StorageException)
  - `interfaces/`: TypeScript interfaces cho storage operations
  - `utils/image-optimization.util.ts`: Image processing với sharp (resize, convert to WebP, validate)
  - `pipes/file-validation.pipe.ts`: File validation pipe cho upload endpoints
- **Avatar Upload Endpoint**:
  - Updated `PATCH /users/avatar` để accept file upload (multipart/form-data)
  - File validation: jpg, png, webp, max 5MB
  - Image processing: Resize to 400x400px, convert to WebP
  - Auto-delete old avatar khi upload mới
  - Storage path: `avatars/{userId}/{timestamp}-{uuid}.webp`
- **Dependencies**: Đã cài đặt `@aws-sdk/client-s3`, `@aws-sdk/lib-storage`, `multer`, `sharp`, `uuid`
- **Documentation**: Tạo `apps/api/src/storage/README.md` với hướng dẫn setup và usage

## Next steps cụ thể

### R2 Storage Setup

- Tạo R2 bucket trên Cloudflare Dashboard
- Tạo API tokens và cấu hình environment variables:
  - `R2_ACCOUNT_ID`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_BUCKET_NAME`
  - `R2_PUBLIC_URL`
  - `R2_ENDPOINT` (optional)
- Test avatar upload endpoint sau khi setup R2
- Setup public access cho R2 bucket nếu cần

### Testing

- Test avatar upload với các file types khác nhau
- Test file validation (size, type)
- Test image optimization
- Test old avatar deletion

## Known bugs / edge cases

- Chưa kiểm tra thực tế trên màn hình rất nhỏ (<360px) hoặc rất rộng (>1600px); có thể cần tinh chỉnh thêm class Tailwind cho các breakpoint đó nếu layout bị lệch.

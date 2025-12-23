# Favicon và App Icons

## Tổng quan

Dự án đã được cấu hình để sử dụng logo WDS (`wds-logo.svg`) làm favicon và các icon cho Android, iOS và các nền tảng khác.

## Cấu trúc Files

### Favicon Files

- `src/app/favicon.ico` - Favicon chính (multi-size ICO)
- `src/app/icon-*.png` - Các icon với kích thước khác nhau (16x16, 32x32, 96x96, 192x192, 512x512)
- `src/app/apple-icon.png` - Apple touch icon (180x180)
- `public/favicon-32x32.png` - Favicon PNG 32x32
- `public/icons/apple-icon.png` - Apple icon trong public directory

### Android Icons

- `public/icons/android-chrome-192x192.png` - Android Chrome icon 192x192
- `public/icons/android-chrome-512x512.png` - Android Chrome icon 512x512
- `public/icons/icon-192x192.png` - Manifest icon 192x192
- `public/icons/icon-512x512.png` - Manifest icon 512x512

### Manifest File

- `public/site.webmanifest` - Web app manifest cho PWA

## Cấu hình

### Layout Metadata

File `src/app/layout.tsx` đã được cấu hình với metadata đầy đủ cho:

- Favicon (nhiều kích thước)
- Apple touch icons
- Android Chrome icons
- Web manifest

### Next.js App Directory

Next.js 13+ tự động nhận diện các file sau trong `app/` directory:

- `favicon.ico`
- `icon.png` (hoặc các file icon-\*.png)
- `apple-icon.png`

## Script Generation

Script `scripts/generate-icons.sh` được sử dụng để tạo tất cả các icon từ file SVG gốc.

### Sử dụng script:

```bash
cd apps/web
bash scripts/generate-icons.sh
```

### Yêu cầu:

- ImageMagick (`convert` command) phải được cài đặt
- File SVG gốc: `public/image/wds-logo.svg`

## Cập nhật Icon

Để cập nhật icon:

1. Thay thế file `public/image/wds-logo.svg` với logo mới
2. Chạy script: `bash scripts/generate-icons.sh`
3. Tất cả các icon sẽ được tự động tạo lại

## Browser Support

- **Chrome/Edge**: Sử dụng favicon.ico và các PNG icons
- **Firefox**: Sử dụng favicon.ico
- **Safari (iOS)**: Sử dụng apple-icon.png
- **Android Chrome**: Sử dụng android-chrome icons và manifest

## Notes

- Tất cả icons được tạo từ cùng một file SVG gốc để đảm bảo tính nhất quán
- Icons được tối ưu hóa kích thước file
- Web manifest hỗ trợ PWA functionality

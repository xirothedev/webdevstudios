# Favicon và App Icons

## Tổng quan

Dự án đã được cấu hình để sử dụng logo WDS (`wds-logo.png`) làm favicon và các icon cho Android, iOS và các nền tảng khác.

## Cấu trúc Files

### Favicon Files

Script `generate-icons.py` tạo các file sau trong `public/` directory:

- `public/favicon.ico` - Favicon chính (multi-size ICO: 16x16, 32x32, 48x48)
- `public/favicon-16x16.png` - Favicon PNG 16x16
- `public/favicon-32x32.png` - Favicon PNG 32x32
- `public/icon-192x192.png` - Icon 192x192 cho Android Chrome và manifest
- `public/icon-512x512.png` - Icon 512x512 cho Android Chrome và manifest
- `public/apple-touch-icon.png` - Apple touch icon (180x180)

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

Next.js 16 tự động nhận diện các file favicon trong `public/` directory:

- `favicon.ico` - Được sử dụng tự động
- `apple-touch-icon.png` - Được sử dụng cho iOS devices
- Các file icon khác được tham chiếu trong metadata

## Script Generation

Script `scripts/generate-icons.py` được sử dụng để tạo tất cả các icon từ file PNG logo.

### Sử dụng script:

```bash
cd apps/web
python3 scripts/generate-icons.py
```

### Yêu cầu:

- Python 3
- PIL/Pillow library (`pip install Pillow`)
- File logo PNG: `public/wds-logo.png`

## Cập nhật Icon

Để cập nhật icon:

1. Thay thế file `public/wds-logo.png` với logo mới (PNG format)
2. Chạy script: `python3 scripts/generate-icons.py`
3. Tất cả các icon sẽ được tự động tạo lại trong `public/` directory

## Browser Support

- **Chrome/Edge**: Sử dụng favicon.ico và các PNG icons
- **Firefox**: Sử dụng favicon.ico
- **Safari (iOS)**: Sử dụng apple-touch-icon.png
- **Android Chrome**: Sử dụng icon-192x192.png và icon-512x512.png trong manifest

## Notes

- Tất cả icons được tạo từ cùng một file PNG gốc để đảm bảo tính nhất quán
- Icons được tối ưu hóa kích thước file
- Web manifest hỗ trợ PWA functionality
- Metadata trong `layout.tsx` và `site.webmanifest` đã được cấu hình để sử dụng đúng các file icon

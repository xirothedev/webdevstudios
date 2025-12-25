# Cloudflare R2 Storage Module

Module này cung cấp tích hợp với Cloudflare R2 để lưu trữ files, đặc biệt là avatar images.

## Setup

### 1. Tạo R2 Bucket trên Cloudflare

1. Đăng nhập vào Cloudflare Dashboard
2. Vào R2 Object Storage
3. Tạo bucket mới (ví dụ: `webdevstudios-storage`)
4. Tạo API Token với quyền read/write

### 2. Cấu hình Environment Variables

Thêm các biến sau vào file `.env`:

```env
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=webdevstudios-storage
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
R2_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
```

**Lưu ý:**

- `R2_ACCOUNT_ID`: Account ID của Cloudflare (tìm trong dashboard)
- `R2_ACCESS_KEY_ID` và `R2_SECRET_ACCESS_KEY`: Tạo từ R2 > Manage R2 API Tokens
- `R2_BUCKET_NAME`: Tên bucket đã tạo
- `R2_PUBLIC_URL`: Public URL của bucket (có thể setup custom domain)
- `R2_ENDPOINT`: Endpoint URL (có thể để trống, sẽ tự động generate từ account ID)

### 3. Setup Public Access (Optional)

Để files có thể truy cập public, cần:

1. Vào R2 bucket settings
2. Enable Public Access
3. Setup CORS nếu cần
4. Lấy Public URL và thêm vào `R2_PUBLIC_URL`

## Usage

### Upload Avatar

```typescript
// Endpoint: PATCH /users/avatar
// Method: multipart/form-data
// Field: file (image file)
// Max size: 5MB
// Allowed types: jpg, jpeg, png, webp
```

Image sẽ được:

- Resize về 400x400px (square, cover fit)
- Convert sang WebP format
- Upload lên R2 với path: `avatars/{userId}/{timestamp}-{uuid}.webp`

### Storage Service

```typescript
// Upload file
const result = await storageService.uploadFile({
  key: 'path/to/file.jpg',
  file: buffer,
  contentType: 'image/jpeg',
});

// Upload image with optimization
const result = await storageService.uploadImage({
  key: 'avatars/user-123/image.webp',
  file: buffer,
  contentType: 'image/jpeg',
  width: 400,
  height: 400,
});

// Delete file
await storageService.deleteFile('path/to/file.jpg');

// Get public URL
const url = storageService.getFileUrl('path/to/file.jpg');
```

## Image Processing

Module sử dụng `sharp` để:

- Validate image format
- Resize images
- Convert to WebP format
- Generate thumbnails (optional)

## Error Handling

Module cung cấp các custom exceptions:

- `FileTooLargeException`: File vượt quá kích thước cho phép
- `InvalidFileTypeException`: File type không được phép
- `ImageProcessingException`: Lỗi khi xử lý image
- `StorageException`: Lỗi khi upload/delete file

## Security

- File validation (type, size)
- Authentication required (JWT guard)
- File name sanitization
- Image optimization để giảm kích thước

## Performance

- Image optimization trước khi upload
- WebP format để giảm kích thước file
- CDN caching với Cloudflare

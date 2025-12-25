<!-- 3478abc0-7d01-40bc-8487-bd11372ea423 f4b3186e-738a-4377-8a38-6addc4a258f7 -->

# Kế hoạch tích hợp Cloudflare R2 Storage

## Tổng quan

Cloudflare R2 là object storage tương thích S3 API, không tính phí egress, phù hợp cho việc lưu trữ avatar và product images. Dự án hiện tại đang accept avatar URL string, cần implement file upload thực sự với R2.

## Kiến trúc tích hợp

### 1. Cấu trúc Module

Tạo module `storage` trong `apps/api/src/storage/` với cấu trúc:

- `storage.module.ts` - NestJS module
- `storage.service.ts` - Service xử lý upload/download/delete với R2
- `storage.config.ts` - Configuration cho R2 (credentials, bucket, endpoint)
- `interfaces/storage.interface.ts` - Interfaces cho storage operations
- `utils/image-optimization.util.ts` - Image optimization/resizing utilities

### 2. Dependencies cần cài đặt

- `@aws-sdk/client-s3` - AWS SDK tương thích với R2 (S3-compatible API)
- `@aws-sdk/lib-storage` - Multipart upload support
- `multer` + `@types/multer` - File upload middleware cho NestJS
- `sharp` - Image optimization và resizing (đã có trong frontend, cần thêm vào backend)
- `uuid` - Generate unique file names

### 3. Environment Variables

Thêm vào `.env`:

```
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=webdevstudios-storage
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
R2_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
```

### 4. Use Cases

#### 4.1 Avatar Upload

- **Endpoint**: `PATCH /users/avatar` (đã có, cần modify)
- **Input**: Multipart form data với file image
- **Validation**:
  - File type: jpg, png, webp
  - Max size: 5MB
  - Image dimensions validation
- **Processing**:
  - Resize to 400x400px (square)
  - Convert to WebP format
  - Generate thumbnail 150x150px
- **Storage Path**: `avatars/{userId}/{timestamp}-{uuid}.webp`
- **Cleanup**: Delete old avatar khi upload mới

### 5. Implementation Steps

#### Step 1: Setup R2 Storage Module

- Tạo `storage.module.ts` với ConfigModule integration
- Tạo `storage.config.ts` để load R2 credentials từ environment
- Tạo `storage.service.ts` với methods:
  - `uploadFile()` - Upload file to R2
  - `deleteFile()` - Delete file from R2
  - `getFileUrl()` - Get public URL
  - `uploadImage()` - Upload với image optimization

#### Step 2: Image Optimization Utility

- Tạo `image-optimization.util.ts` với functions:
  - `resizeImage()` - Resize image với sharp
  - `convertToWebP()` - Convert to WebP format
  - `validateImage()` - Validate image format và size
  - `generateThumbnail()` - Generate thumbnail

#### Step 3: Update Avatar Upload Endpoint

- Modify `users.controller.ts`:
  - Thêm `@UseInterceptors(FileInterceptor('file'))` decorator
  - Change DTO từ `UpdateAvatarDto` (string) sang `FileUploadDto`
  - Validate file trong controller hoặc pipe
- Modify `update-avatar.handler.ts`:
  - Upload file to R2 thay vì accept URL
  - Delete old avatar nếu có
  - Return CDN URL

#### Step 4: Error Handling

- Tạo custom exceptions:
  - `FileTooLargeException`
  - `InvalidFileTypeException`
  - `ImageProcessingException`
  - `StorageException`

#### Step 5: Testing

- Unit tests cho storage service
- Integration tests cho avatar upload endpoint
- Test image optimization
- Test error cases (invalid file, too large, etc.)

### 6. File Structure

```
apps/api/src/storage/
├── storage.module.ts
├── storage.service.ts
├── storage.config.ts
├── interfaces/
│   └── storage.interface.ts
├── utils/
│   └── image-optimization.util.ts
└── exceptions/
    ├── file-too-large.exception.ts
    ├── invalid-file-type.exception.ts
    └── storage.exception.ts
```

### 7. Security Considerations

- File validation (type, size, dimensions)
- Rate limiting cho upload endpoints
- Authentication required (đã có JWT guard)
- Sanitize file names
- Virus scanning (optional, future)

### 8. Performance Optimization

- Use multipart upload cho files > 5MB
- Image optimization trước khi upload
- CDN caching với Cloudflare

### 9. Migration Path

1. **Phase 1**: Implement R2 storage module và avatar upload
2. **Phase 2**: Migrate existing avatar URLs (nếu có) - chỉ migrate avatars từ OAuth providers hoặc existing URLs
3. **Phase 3**: Add advanced image optimization (thumbnails, multiple sizes) nếu cần

### 10. Documentation

- Update API documentation (Swagger) với file upload examples
- Document R2 setup process
- Document image optimization settings
- Update FEATURES.log

## Technical Details

### R2 Configuration

- Sử dụng AWS SDK v3 (`@aws-sdk/client-s3`)
- Endpoint: `https://{account_id}.r2.cloudflarestorage.com`
- Region: `auto` (Cloudflare tự động route)
- Public URL: Có thể setup custom domain hoặc dùng R2 public URL

### Image Processing

- Library: `sharp` (đã có trong frontend, cần thêm vào backend)
- Formats: WebP (primary), fallback to original nếu không support
- Sizes:
  - Avatar: 400x400px (square)
  - Avatar thumbnail: 150x150px

### File Naming Strategy

- Pattern: `{prefix}/{identifier}/{timestamp}-{uuid}.{ext}`
- Examples:
  - Avatar: `avatars/user-123/1704067200000-abc123.webp`

## References

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [AWS SDK v3 S3 Client](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)
- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)

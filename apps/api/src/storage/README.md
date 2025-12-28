# Cloudflare R2 Storage Module

This module provides integration with Cloudflare R2 for file storage, especially avatar images.

## Setup

### 1. Create R2 Bucket on Cloudflare

1. Log in to Cloudflare Dashboard
2. Go to R2 Object Storage
3. Create new bucket (e.g.: `webdevstudios-storage`)
4. Create API Token with read/write permissions

### 2. Configure Environment Variables

Add the following variables to `.env` file:

```env
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=webdevstudios-storage
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
R2_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
```

**Notes:**

- `R2_ACCOUNT_ID`: Cloudflare Account ID (find in dashboard)
- `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`: Create from R2 > Manage R2 API Tokens
- `R2_BUCKET_NAME`: Name of created bucket
- `R2_PUBLIC_URL`: Public URL of bucket (can setup custom domain)
- `R2_ENDPOINT`: Endpoint URL (can be left empty, will auto-generate from account ID)

### 3. Setup Public Access (Optional)

To make files publicly accessible:

1. Go to R2 bucket settings
2. Enable Public Access
3. Setup CORS if needed
4. Get Public URL and add to `R2_PUBLIC_URL`

## Usage

### Upload Avatar

```typescript
// Endpoint: PATCH /users/avatar
// Method: multipart/form-data
// Field: file (image file)
// Max size: 5MB
// Allowed types: jpg, jpeg, png, webp
```

Image will be:

- Resized to 400x400px (square, cover fit)
- Converted to WebP format
- Uploaded to R2 with path: `avatars/{userId}/{timestamp}-{uuid}.webp`

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

Module uses `sharp` to:

- Validate image format
- Resize images
- Convert to WebP format
- Generate thumbnails (optional)

## Error Handling

Module provides custom exceptions:

- `FileTooLargeException`: File exceeds allowed size
- `InvalidFileTypeException`: File type not allowed
- `ImageProcessingException`: Error when processing image
- `StorageException`: Error when uploading/deleting file

## Security

- File validation (type, size)
- Authentication required (JWT guard)
- File name sanitization
- Image optimization to reduce file size

## Performance

- Image optimization before upload
- WebP format to reduce file size
- CDN caching with Cloudflare

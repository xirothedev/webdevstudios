## Current Project Status

- Monorepo `webdevtudios-fullstack-turborepo` with web app using Next.js (App Router), Tailwind CSS, motion/react and Next Image for landing page / shop.
- `FeaturesGrid` on the website displays 4 WebDev Studios merch products: t-shirt, badge, lanyard and limited mouse pad, with glassmorphism effects and light 3D animations.

## What Has Been Achieved in This Session

### Frontend (Previous)

- Increased size of WDS t-shirt product image block in `FeaturesGrid` with hero style, while increasing hover effects (scale, translate Y axis, slight rotate) and strengthening glow/shadow for better prominence.
- Adjusted lanyard image (`/shop/day-deo.webp`) in Bag & Backpack card to full-width, clearer horizontal ratio, gentle hover for users to view detailed preview.
- Updated card titles and descriptions to match image file/product names:
  - WebDev Studios Badge (`huy-hieu.webp`)
  - WebDev Studios Lanyard (`day-deo.webp`)
  - WebDev Studios Limited Edition Mouse Pad (`pad-chuot.webp`)

### Backend - Cloudflare R2 Storage Integration

- **Cloudflare R2 Storage Integration**: Created complete storage module with AWS SDK v3 (S3-compatible API)
- **Storage Module** (`apps/api/src/storage/`):
  - `storage.service.ts`: Service handling upload/download/delete with R2
  - `storage.config.ts`: Configuration for R2 credentials
  - `storage.module.ts`: NestJS module
  - `exceptions/`: Custom exceptions (FileTooLargeException, InvalidFileTypeException, ImageProcessingException, StorageException)
  - `interfaces/`: TypeScript interfaces for storage operations
  - `utils/image-optimization.util.ts`: Image processing with sharp (resize, convert to WebP, validate)
  - `pipes/file-validation.pipe.ts`: File validation pipe for upload endpoints
- **Avatar Upload Endpoint**:
  - Updated `PATCH /users/avatar` to accept file upload (multipart/form-data)
  - File validation: jpg, png, webp, max 5MB
  - Image processing: Resize to 400x400px, convert to WebP
  - Auto-delete old avatar when uploading new one
  - Storage path: `avatars/{userId}/{timestamp}-{uuid}.webp`
- **Dependencies**: Installed `@aws-sdk/client-s3`, `@aws-sdk/lib-storage`, `multer`, `sharp`, `uuid`
- **Documentation**: Created `apps/api/src/storage/README.md` with setup and usage instructions

## Specific Next Steps

### R2 Storage Setup

- Create R2 bucket on Cloudflare Dashboard
- Create API tokens and configure environment variables:
  - `R2_ACCOUNT_ID`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_BUCKET_NAME`
  - `R2_PUBLIC_URL`
  - `R2_ENDPOINT` (optional)
- Test avatar upload endpoint after R2 setup
- Setup public access for R2 bucket if needed

### Testing

- Test avatar upload with different file types
- Test file validation (size, type)
- Test image optimization
- Test old avatar deletion

## Known bugs / edge cases

- Not yet tested on very small screens (<360px) or very wide screens (>1600px); may need additional Tailwind class adjustments for those breakpoints if layout is misaligned.

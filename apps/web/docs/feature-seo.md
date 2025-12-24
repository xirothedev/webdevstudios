# SEO Configuration

## Tổng quan

Dự án đã được cấu hình đầy đủ SEO với các tính năng:

- **Metadata đầy đủ**: Title, description, keywords cho từng trang
- **Open Graph tags**: Cho Facebook và các mạng xã hội khác
- **Twitter Cards**: Tối ưu hiển thị trên Twitter
- **Structured Data (JSON-LD)**: Schema.org markup cho search engines
- **Sitemap**: Tự động generate sitemap.xml
- **Robots.txt**: Hướng dẫn crawlers

## Cấu trúc Files

### Core SEO Files

- `src/lib/metadata.ts` - Metadata configuration và helper functions
- `src/lib/structured-data.ts` - Structured data (JSON-LD) schemas
- `src/components/StructuredData.tsx` - Component để inject structured data
- `src/app/sitemap.ts` - Dynamic sitemap generation
- `public/robots.txt` - Robots.txt file

### Page Metadata

Mỗi trang có metadata riêng được định nghĩa trong file page:

- `src/app/page.tsx` - Home page metadata
- `src/app/about/page.tsx` - About page metadata
- `src/app/shop/page.tsx` - Shop page metadata

## Cấu hình

### Environment Variables

Thêm vào `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=https://webdevstudios.org
```

Nếu không có, sẽ sử dụng default: `https://webdevstudios.org`

### Metadata Configuration

File `src/lib/metadata.ts` chứa:

- **defaultMetadata**: Metadata mặc định cho toàn site
- **createPageMetadata()**: Helper function để tạo metadata cho từng trang

### Structured Data

File `src/lib/structured-data.ts` chứa các schemas:

- **Organization Schema**: Thông tin về tổ chức
- **WebSite Schema**: Thông tin về website
- **Breadcrumb Schema**: Breadcrumb navigation
- **Page Schema**: Schema cho từng trang

## Sử dụng

### Thêm Metadata cho trang mới

```typescript
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Tên trang',
  description: 'Mô tả trang',
  path: '/path-to-page',
  image: '/path-to-image.png', // Optional
  keywords: ['keyword1', 'keyword2'], // Optional
});
```

### Thêm Structured Data cho trang

```typescript
import { getPageSchema } from '@/lib/structured-data';
import { siteUrl } from '@/lib/metadata';

// Trong component
const pageSchema = getPageSchema({
  title: 'Tên trang',
  description: 'Mô tả',
  url: `${siteUrl}/path`,
  image: '/image.png',
});

// Thêm vào component
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
/>
```

### Cập nhật Sitemap

Chỉnh sửa `src/app/sitemap.ts` để thêm routes mới:

```typescript
const routes = [
  '',
  '/about',
  '/shop',
  '/new-page', // Thêm route mới
];
```

## SEO Features

### 1. Meta Tags

- ✅ Title tags với template
- ✅ Meta description
- ✅ Keywords
- ✅ Author và Publisher
- ✅ Canonical URLs
- ✅ Language tags

### 2. Open Graph

- ✅ og:title
- ✅ og:description
- ✅ og:image
- ✅ og:url
- ✅ og:type
- ✅ og:site_name
- ✅ og:locale

### 3. Twitter Cards

- ✅ twitter:card (summary_large_image)
- ✅ twitter:title
- ✅ twitter:description
- ✅ twitter:image
- ✅ twitter:creator

### 4. Structured Data

- ✅ Organization Schema
- ✅ WebSite Schema
- ✅ Breadcrumb Schema (có thể thêm cho từng trang)
- ✅ Page Schema (có thể thêm cho từng trang)

### 5. Technical SEO

- ✅ Robots.txt
- ✅ Sitemap.xml (auto-generated)
- ✅ Canonical URLs
- ✅ Mobile-friendly (responsive design)
- ✅ Fast loading (Next.js optimization)

## Verification

### Google Search Console

1. Thêm verification code vào `src/lib/metadata.ts`:

```typescript
verification: {
  google: 'your-google-verification-code',
},
```

### Bing Webmaster Tools

1. Thêm verification code vào `src/lib/metadata.ts`:

```typescript
verification: {
  // ... other verifications
  yahoo: 'your-bing-verification-code',
},
```

## Best Practices

1. **Unique Titles**: Mỗi trang có title riêng, không trùng lặp
2. **Descriptive Descriptions**: Mô tả rõ ràng, hấp dẫn, 150-160 ký tự
3. **Keywords**: Sử dụng keywords tự nhiên, không spam
4. **Images**: Sử dụng images có kích thước phù hợp (1200x630 cho OG)
5. **Canonical URLs**: Đảm bảo mỗi trang có canonical URL
6. **Structured Data**: Validate với [Google Rich Results Test](https://search.google.com/test/rich-results)

## Testing

### Tools để test SEO

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
3. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
4. **Google Search Console**: https://search.google.com/search-console
5. **Schema Markup Validator**: https://validator.schema.org/

### Local Testing

```bash
# Build và start production server
pnpm build
pnpm start

# Test sitemap
curl http://localhost:3000/sitemap.xml

# Test robots.txt
curl http://localhost:3000/robots.txt
```

## Notes

- Metadata được tự động merge với defaultMetadata
- Sitemap tự động generate từ routes trong sitemap.ts
- Structured data được inject vào mọi trang qua StructuredData component
- Robots.txt cho phép tất cả crawlers, chỉ disallow admin và API routes

## Future Enhancements

- [ ] Thêm Article schema cho blog posts
- [ ] Thêm FAQ schema cho FAQ page
- [ ] Thêm Event schema cho events
- [ ] Thêm Person schema cho team members
- [ ] Auto-generate sitemap từ routes
- [ ] Add hreflang tags cho đa ngôn ngữ

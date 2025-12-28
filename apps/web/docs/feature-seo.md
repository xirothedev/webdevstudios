# SEO Configuration

## Overview

The project has been fully configured with SEO features:

- **Complete Metadata**: Title, description, keywords for each page
- **Open Graph tags**: For Facebook and other social networks
- **Twitter Cards**: Optimized display on Twitter
- **Structured Data (JSON-LD)**: Schema.org markup for search engines
- **Sitemap**: Auto-generated sitemap.xml
- **Robots.txt**: Crawler instructions

## File Structure

### Core SEO Files

- `src/lib/metadata.ts` - Metadata configuration and helper functions
- `src/lib/structured-data.ts` - Structured data (JSON-LD) schemas
- `src/components/StructuredData.tsx` - Component to inject structured data
- `src/app/sitemap.ts` - Dynamic sitemap generation
- `src/app/robots.ts` - Dynamic robots.txt generation

### Page Metadata

Each page has its own metadata defined in the page file:

- `src/app/page.tsx` - Home page metadata
- `src/app/about/page.tsx` - About page metadata
- `src/app/shop/page.tsx` - Shop page metadata

## Configuration

### Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=https://webdevstudios.xirothedev.site/
```

If not provided, will use default: `https://webdevstudios.xirothedev.site/`

### Metadata Configuration

File `src/lib/metadata.ts` contains:

- **defaultMetadata**: Default metadata for entire site
- **createPageMetadata()**: Helper function to create metadata for each page

### Structured Data

File `src/lib/structured-data.ts` contains schemas:

- **Organization Schema**: Organization information
- **WebSite Schema**: Website information
- **Breadcrumb Schema**: Breadcrumb navigation
- **Page Schema**: Schema for each page

## Usage

### Add Metadata for New Page

```typescript
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Page Title',
  description: 'Page description',
  path: '/path-to-page',
  image: '/path-to-image.png', // Optional
  keywords: ['keyword1', 'keyword2'], // Optional
});
```

### Add Structured Data for Page

```typescript
import { getPageSchema } from '@/lib/structured-data';
import { siteUrl } from '@/lib/metadata';

// In component
const pageSchema = getPageSchema({
  title: 'Page Title',
  description: 'Description',
  url: `${siteUrl}/path`,
  image: '/image.png',
});

// Add to component
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
/>
```

### Update Sitemap

Edit `src/app/sitemap.ts` to add new routes:

```typescript
const routes = [
  '',
  '/about',
  '/shop',
  '/new-page', // Add new route
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
- ✅ Breadcrumb Schema (can be added for each page)
- ✅ Page Schema (can be added for each page)

### 5. Technical SEO

- ✅ Robots.txt
- ✅ Sitemap.xml (auto-generated)
- ✅ Canonical URLs
- ✅ Mobile-friendly (responsive design)
- ✅ Fast loading (Next.js optimization)

## Verification

### Google Search Console

1. Add verification code to `src/lib/metadata.ts`:

```typescript
verification: {
  google: 'your-google-verification-code',
},
```

### Bing Webmaster Tools

1. Add verification code to `src/lib/metadata.ts`:

```typescript
verification: {
  // ... other verifications
  yahoo: 'your-bing-verification-code',
},
```

## Best Practices

1. **Unique Titles**: Each page has unique title, no duplicates
2. **Descriptive Descriptions**: Clear, engaging descriptions, 150-160 characters
3. **Keywords**: Use natural keywords, no spam
4. **Images**: Use images with appropriate size (1200x630 for OG)
5. **Canonical URLs**: Ensure each page has canonical URL
6. **Structured Data**: Validate with [Google Rich Results Test](https://search.google.com/test/rich-results)

## Testing

### SEO Testing Tools

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
3. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
4. **Google Search Console**: https://search.google.com/search-console
5. **Schema Markup Validator**: https://validator.schema.org/

### Local Testing

```bash
# Build and start production server
pnpm build
pnpm start

# Test sitemap
curl http://localhost:3000/sitemap.xml

# Test robots.txt (auto-generated with dynamic domain)
curl http://localhost:3000/robots.txt
```

## Notes

- Metadata is automatically merged with defaultMetadata
- Sitemap automatically generated from routes in sitemap.ts
- **Robots.txt automatically generated** from `src/app/robots.ts` with dynamic domain from `NEXT_PUBLIC_SITE_URL`
- Structured data is injected into all pages via StructuredData component
- Robots.txt allows all crawlers, only disallows admin and API routes

## Future Enhancements

- [ ] Add Article schema for blog posts
- [ ] Add FAQ schema for FAQ page
- [ ] Add Event schema for events
- [ ] Add Person schema for team members
- [ ] Auto-generate sitemap from routes
- [ ] Add hreflang tags for multi-language

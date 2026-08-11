/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { BlogPostSeedData } from './types';

export const blogPost: BlogPostSeedData = {
  slug: 'performance-optimization-web-apps',
  title: 'Performance Optimization for Web Applications',
  excerpt:
    'Discover techniques and strategies for optimizing web application performance, including code splitting, lazy loading, and caching.',
  content: `# Performance Optimization for Web Applications

Performance is critical for user experience. Let's explore optimization techniques.

## Code Splitting

Split your code into smaller chunks:

\`\`\`typescript
// Dynamic import
const HeavyComponent = lazy(() => import('./HeavyComponent'));
\`\`\`

## Lazy Loading

Load resources only when needed:

\`\`\`typescript
// Images
<img loading="lazy" src="image.jpg" alt="Description" />

// Components
const Modal = lazy(() => import('./Modal'));
\`\`\`

## Caching Strategies

### Browser Caching

\`\`\`typescript
// Set cache headers
res.setHeader('Cache-Control', 'public, max-age=3600');
\`\`\`

### CDN Caching

Use CDN for static assets:

- Images
- CSS/JS files
- Fonts

## Database Optimization

- Use indexes
- Optimize queries
- Implement connection pooling
- Use read replicas

## Image Optimization

- Use WebP format
- Implement responsive images
- Lazy load images
- Use image CDN

## Monitoring

Track performance metrics:

- Core Web Vitals
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)

## Conclusion

Performance optimization is an ongoing process. Monitor and iterate!`,
  metaTitle: 'Web Application Performance Optimization | WebDev Studios',
  metaDescription:
    'Learn techniques for optimizing web application performance including code splitting, lazy loading, and caching.',
  isPublished: true,
};

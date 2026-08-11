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
  slug: 'tailwind-css-v4-new-features',
  title: "Tailwind CSS v4: What's New and How to Use It",
  excerpt:
    'Explore the new features in Tailwind CSS v4, including improved performance, new utilities, and better developer experience.',
  content: `# Tailwind CSS v4: What's New and How to Use It

Tailwind CSS v4 brings exciting new features and improvements. Let's explore what's new.

## New Features

### Improved Performance

Tailwind v4 has significantly improved build performance:

- Faster compilation
- Better tree-shaking
- Optimized output

### New Utilities

Several new utility classes have been added:

\`\`\`html
<div class="text-balance">Balanced text</div>
<div class="size-4">Square element</div>
\`\`\`

### Better TypeScript Support

Enhanced TypeScript integration with better autocomplete and type safety.

## Migration Guide

### Update Configuration

\`\`\`javascript
// tailwind.config.js
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
};
\`\`\`

### Update Dependencies

\`\`\`bash
npm install -D tailwindcss@latest
\`\`\`

## Best Practices

- Use the new utilities where appropriate
- Leverage improved performance
- Take advantage of better TypeScript support

## Conclusion

Tailwind CSS v4 is a significant improvement. Upgrade today!`,
  metaTitle: 'Tailwind CSS v4 New Features Guide | WebDev Studios',
  metaDescription:
    'Learn about new features in Tailwind CSS v4 including improved performance, new utilities, and better developer experience.',
  isPublished: true,
};

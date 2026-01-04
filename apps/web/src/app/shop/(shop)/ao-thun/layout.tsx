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

import type { Metadata } from 'next';

import { createPageMetadata, SEO_IMAGES } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Áo thun WebDev Studios',
  description:
    'Áo thun chất lượng cao với logo WebDev Studios, size đa dạng. Thiết kế độc đáo dành riêng cho thành viên câu lạc bộ.',
  path: '/shop/ao-thun',
  image: SEO_IMAGES['/shop/ao-thun'],
  keywords: [
    'Áo thun WDS',
    'WebDev Studios',
    'Áo thun câu lạc bộ',
    'Merchandise UIT',
  ],
});

export default function AoThunLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

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
  title: 'Dây đeo WebDev Studios',
  description:
    'Dây đeo (lanyard) nằm ngang với branding WebDev Studios, tiện lợi cho thẻ nhân viên, thẻ hội viên hoặc keychain. Chất liệu bền chắc, thiết kế chuyên nghiệp.',
  path: '/shop/day-deo',
  image: SEO_IMAGES['/shop/day-deo'],
  keywords: [
    'Dây đeo WDS',
    'Lanyard WebDev Studios',
    'Dây đeo thẻ nhân viên',
    'Merchandise UIT',
  ],
});

export default function DayDeoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

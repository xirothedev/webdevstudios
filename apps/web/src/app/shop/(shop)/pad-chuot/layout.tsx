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
  title: 'Pad chuột WebDev Studios Limited Edition',
  description:
    'Pad chuột cỡ lớn phiên bản giới hạn với thiết kế WebDev Studios, tối ưu cho developer và designer thường xuyên dùng chuột.',
  path: '/shop/pad-chuot',
  image: SEO_IMAGES['/shop/pad-chuot'],
  keywords: [
    'Pad chuột WDS',
    'WebDev Studios',
    'Mouse pad Limited Edition',
    'Pad chuột developer',
  ],
});

export default function PadChuotLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

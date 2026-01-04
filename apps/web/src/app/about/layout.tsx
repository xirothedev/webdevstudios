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
  title: 'Về chúng tôi',
  description:
    'Tìm hiểu về WebDev Studios - Câu lạc bộ lập trình web của sinh viên UIT. Tiểu sử, định hướng, tầm nhìn, sứ mệnh và phạm vi hoạt động của chúng tôi.',
  path: '/about',
  image: SEO_IMAGES['/about'],
  keywords: [
    'Về WebDev Studios',
    'Giới thiệu WebDev Studios',
    'Câu lạc bộ UIT',
    'Lịch sử WebDev Studios',
  ],
});

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

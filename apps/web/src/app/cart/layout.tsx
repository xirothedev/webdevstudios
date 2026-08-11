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
  title: 'Giỏ hàng',
  description:
    'Xem và quản lý giỏ hàng của bạn tại WebDev Studios. Kiểm tra sản phẩm, số lượng và tổng tiền trước khi thanh toán.',
  path: '/cart',
  image: SEO_IMAGES['/cart'],
  keywords: [
    'Giỏ hàng',
    'Shopping cart',
    'Mua sắm',
    'WebDev Studios',
    'E-commerce',
    'Thương mại điện tử',
  ],
});

export default function CartLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

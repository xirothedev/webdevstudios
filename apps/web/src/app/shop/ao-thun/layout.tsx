import type { Metadata } from 'next';

import { createPageMetadata, SEO_IMAGES } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Áo thun WebDev Studios',
  description:
    'Áo thun chất lượng cao với logo WebDev Studios, size đa dạng. Thiết kế độc đáo dành riêng cho thành viên câu lạc bộ.',
  path: '/shop/ao-thun',
  image: SEO_IMAGES['/shop'],
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

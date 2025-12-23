import type { Metadata } from 'next';

import { createPageMetadata, SEO_IMAGES } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Huy hiệu WebDev Studios',
  description:
    'Huy hiệu kim loại với logo WebDev Studios, phù hợp gắn balo, áo khoác hoặc túi laptop cho member WDS. Thiết kế tinh xảo, chất liệu kim loại cao cấp.',
  path: '/shop/huy-hieu',
  image: SEO_IMAGES['/shop/huy-hieu'],
  keywords: [
    'Huy hiệu WDS',
    'WebDev Studios',
    'Huy hiệu câu lạc bộ',
    'Merchandise UIT',
  ],
});

export default function HuyHieuLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

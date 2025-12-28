import type { Metadata } from 'next';

import { createPageMetadata, SEO_IMAGES } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'E-commerce Platform',
  description:
    'Khám phá nền tảng thương mại điện tử hiện đại với giao diện đẹp mắt và trải nghiệm người dùng tuyệt vời.',
  path: '/shop',
  image: SEO_IMAGES['/shop'],
  keywords: [
    'E-commerce',
    'Thương mại điện tử',
    'E-commerce platform',
    'Mua sắm online',
  ],
});

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

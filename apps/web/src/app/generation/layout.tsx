import type { Metadata } from 'next';

import { createPageMetadata, SEO_IMAGES } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Các thế hệ lãnh đạo',
  description:
    'Khám phá hành trình của WebDev Studios qua các thế hệ lãnh đạo tận tụy đã kiến tạo cộng đồng của chúng tôi.',
  path: '/generation',
  image: SEO_IMAGES['/generation'],
  keywords: [
    'Thế hệ lãnh đạo WebDev Studios',
    'Lịch sử WebDev Studios',
    'Các thế hệ WebDev',
    'Ban chủ nhiệm WebDev',
  ],
});

export default function GenerationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

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

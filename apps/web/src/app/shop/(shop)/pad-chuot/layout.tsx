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

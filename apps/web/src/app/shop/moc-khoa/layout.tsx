import type { Metadata } from 'next';

import { createPageMetadata, SEO_IMAGES } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Móc khóa WebDev Studios',
  description:
    'Móc khóa kim loại với logo WebDev Studios, thiết kế độc đáo và bền chắc. Phù hợp để treo chìa khóa, túi xách hoặc làm vật trang trí.',
  path: '/shop/moc-khoa',
  image: SEO_IMAGES['/shop/moc-khoa'],
  keywords: [
    'Móc khóa WDS',
    'WebDev Studios',
    'Keychain WebDev Studios',
    'Merchandise UIT',
  ],
});

export default function MocKhoaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

import type { Metadata } from 'next';

import { createPageMetadata, SEO_IMAGES } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Chính sách quyền riêng tư',
  description:
    'Chính sách quyền riêng tư của WebDev Studios - Cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.',
  path: '/privacy',
  image: SEO_IMAGES['/privacy'],
  keywords: [
    'Chính sách quyền riêng tư',
    'Privacy Policy',
    'WebDev Studios',
    'Bảo mật',
  ],
});

export default function PrivacyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

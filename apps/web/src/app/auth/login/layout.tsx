import type { Metadata } from 'next';

import { createPageMetadata, SEO_IMAGES } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Đăng nhập',
  description:
    'Đăng nhập vào tài khoản WebDev Studios để truy cập các tính năng độc quyền.',
  path: '/auth/login',
  image: SEO_IMAGES['/'],
  keywords: [
    'Đăng nhập WDS',
    'WebDev Studios login',
    'Đăng nhập vào WebDev Studios',
  ],
});

export default function SignupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

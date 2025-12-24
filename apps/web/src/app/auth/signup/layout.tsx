import type { Metadata } from 'next';

import { createPageMetadata, SEO_IMAGES } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Đăng ký',
  description:
    'Tạo tài khoản WebDev Studios để truy cập các tính năng độc quyền, quản lý đơn hàng và tham gia cộng đồng.',
  path: '/auth/signup',
  image: SEO_IMAGES['/'],
  keywords: [
    'Đăng ký WDS',
    'WebDev Studios signup',
    'Tạo tài khoản WebDev Studios',
  ],
});

export default function SignupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

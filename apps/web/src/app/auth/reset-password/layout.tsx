import type { Metadata } from 'next';

import { createPageMetadata, SEO_IMAGES } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Đặt lại mật khẩu',
  description: 'Đặt lại mật khẩu mới cho tài khoản WebDev Studios của bạn.',
  path: '/auth/reset-password',
  image: SEO_IMAGES['/'],
  keywords: [
    'Đặt lại mật khẩu',
    'Reset password',
    'Tạo mật khẩu mới',
    'Đổi mật khẩu WDS',
  ],
});

export default function ResetPasswordLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

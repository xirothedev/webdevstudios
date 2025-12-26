import type { Metadata } from 'next';

import { createPageMetadata, SEO_IMAGES } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Quên mật khẩu',
  description:
    'Quên mật khẩu? Nhận link đặt lại mật khẩu qua email tại WebDev Studios.',
  path: '/auth/forgot-password',
  image: SEO_IMAGES['/'],
  keywords: [
    'Quên mật khẩu',
    'Reset mật khẩu',
    'Lấy lại mật khẩu',
    'Forgot password WDS',
  ],
});

export default function ForgotPasswordLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

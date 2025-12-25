import type { Metadata } from 'next';

import { createPageMetadata, SEO_IMAGES } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Xác thực email',
  description:
    'Xác thực địa chỉ email của bạn để hoàn tất đăng ký tài khoản WebDev Studios.',
  path: '/auth/verify-email',
  image: SEO_IMAGES['/'],
  keywords: [
    'Xác thực email WDS',
    'WebDev Studios verify email',
    'Xác thực tài khoản WebDev Studios',
  ],
});

export default function VerifyEmailLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

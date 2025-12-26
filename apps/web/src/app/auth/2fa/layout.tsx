import type { Metadata } from 'next';

import { createPageMetadata, SEO_IMAGES } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Xác thực 2FA',
  description:
    'Xác thực hai yếu tố để bảo vệ tài khoản của bạn tại WebDev Studios.',
  path: '/auth/2fa',
  image: SEO_IMAGES['/'],
  keywords: [
    'Xác thực 2FA',
    'Two-factor authentication',
    'Bảo mật 2 lớp WDS',
    'Mã xác thực',
  ],
});

export default function Verify2FALayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

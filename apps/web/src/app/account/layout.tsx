import type { Metadata } from 'next';

import { createPageMetadata } from '@/lib/metadata';

export const metadata: Metadata = {
  ...createPageMetadata({
    title: 'Tài khoản',
    description:
      'Quản lý tài khoản WebDev Studios - Hồ sơ cá nhân, cài đặt bảo mật và cấu hình tài khoản.',
    path: '/account',
    keywords: [
      'Tài khoản WebDev Studios',
      'Quản lý tài khoản',
      'Cài đặt tài khoản',
      'Hồ sơ cá nhân',
    ],
  }),
  robots: {
    index: false, // Private pages - do not index
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

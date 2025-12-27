import type { Metadata } from 'next';

import { createPageMetadata } from '@/lib/metadata';

export const metadata: Metadata = {
  ...createPageMetadata({
    title: 'Cài đặt',
    description:
      'Quản lý cài đặt bảo mật, phiên làm việc và cấu hình tài khoản của bạn tại WebDev Studios.',
    path: '/account/settings',
    keywords: [
      'Cài đặt tài khoản',
      'Bảo mật tài khoản',
      'Quản lý phiên làm việc',
      'Cài đặt WebDev Studios',
    ],
  }),
  robots: {
    index: false, // Private page - không index
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

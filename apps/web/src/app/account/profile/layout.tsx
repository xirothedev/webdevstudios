import type { Metadata } from 'next';

import { createPageMetadata } from '@/lib/metadata';

export const metadata: Metadata = {
  ...createPageMetadata({
    title: 'Hồ sơ của tôi',
    description:
      'Quản lý thông tin cá nhân, cập nhật ảnh đại diện và cài đặt tài khoản của bạn tại WebDev Studios.',
    path: '/account/profile',
    keywords: [
      'Hồ sơ cá nhân',
      'Quản lý tài khoản',
      'Cập nhật thông tin',
      'Tài khoản WebDev Studios',
    ],
  }),
  robots: {
    index: false, // Private page - do not index
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

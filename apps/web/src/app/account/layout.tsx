/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

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

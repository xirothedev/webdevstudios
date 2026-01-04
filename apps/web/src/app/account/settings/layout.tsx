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
    index: false, // Private page - do not index
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

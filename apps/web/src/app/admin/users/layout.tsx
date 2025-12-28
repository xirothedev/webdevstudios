import type { Metadata } from 'next';

import { createAdminPageMetadata } from '../metadata';

export const metadata: Metadata = createAdminPageMetadata({
  title: 'Quản lý Users',
  description: 'Quản lý người dùng trong hệ thống WebDev Studios',
  path: '/admin/users',
});

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

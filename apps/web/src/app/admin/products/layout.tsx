import type { Metadata } from 'next';

import { createAdminPageMetadata } from '../metadata';

export const metadata: Metadata = createAdminPageMetadata({
  title: 'Quản lý Products',
  description: 'Quản lý sản phẩm trong hệ thống WebDev Studios',
  path: '/admin/products',
});

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

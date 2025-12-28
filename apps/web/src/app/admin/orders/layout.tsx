import type { Metadata } from 'next';

import { createAdminPageMetadata } from '../metadata';

export const metadata: Metadata = createAdminPageMetadata({
  title: 'Quản lý Orders',
  description: 'Quản lý đơn hàng trong hệ thống WebDev Studios',
  path: '/admin/orders',
});

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

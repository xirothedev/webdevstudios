import type { Metadata } from 'next';

import { createAdminPageMetadata } from '../metadata';

export const metadata: Metadata = createAdminPageMetadata({
  title: 'Quản lý Transactions',
  description: 'Quản lý giao dịch thanh toán trong hệ thống WebDev Studios',
  path: '/admin/transactions',
});

export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import type { Metadata } from 'next';

import { createAdminPageMetadata } from './metadata';

export const metadata: Metadata = createAdminPageMetadata({
  title: 'Admin Dashboard',
  description: 'Trang quản trị hệ thống WebDev Studios - Tổng quan và thống kê',
  path: '/admin',
});

import { AdminDashboardContent } from './dashboard-content';

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}

'use client';

import { AdminHeader } from '@/components/admin/AdminHeader';

export function AdminDashboardContent() {
  return (
    <div className="flex h-full flex-col">
      <AdminHeader
        title="Dashboard"
        description="Tổng quan hệ thống và thống kê"
      />
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="border-wds-accent/30 bg-wds-accent/10 rounded-2xl border p-6">
            <h3 className="text-wds-text/70 text-sm font-medium">Tổng Users</h3>
            <p className="text-wds-text mt-2 text-3xl font-bold">-</p>
          </div>
          <div className="border-wds-accent/30 bg-wds-accent/10 rounded-2xl border p-6">
            <h3 className="text-wds-text/70 text-sm font-medium">
              Tổng Products
            </h3>
            <p className="text-wds-text mt-2 text-3xl font-bold">-</p>
          </div>
          <div className="border-wds-accent/30 bg-wds-accent/10 rounded-2xl border p-6">
            <h3 className="text-wds-text/70 text-sm font-medium">
              Tổng Orders
            </h3>
            <p className="text-wds-text mt-2 text-3xl font-bold">-</p>
          </div>
          <div className="border-wds-accent/30 bg-wds-accent/10 rounded-2xl border p-6">
            <h3 className="text-wds-text/70 text-sm font-medium">Doanh thu</h3>
            <p className="text-wds-text mt-2 text-3xl font-bold">-</p>
          </div>
        </div>
      </div>
    </div>
  );
}

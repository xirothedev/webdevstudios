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

'use client';

import { useQuery } from '@tanstack/react-query';

import { AdminChart } from '@/components/admin/AdminChart';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/admin';

// Mock data for charts (will be replaced with real data later)
const revenueData = [
  { name: 'Tháng 1', revenue: 4500000 },
  { name: 'Tháng 2', revenue: 5200000 },
  { name: 'Tháng 3', revenue: 4800000 },
  { name: 'Tháng 4', revenue: 6100000 },
  { name: 'Tháng 5', revenue: 5500000 },
  { name: 'Tháng 6', revenue: 6700000 },
];

const ordersData = [
  { name: 'Tháng 1', orders: 12 },
  { name: 'Tháng 2', orders: 19 },
  { name: 'Tháng 3', orders: 15 },
  { name: 'Tháng 4', orders: 22 },
  { name: 'Tháng 5', orders: 18 },
  { name: 'Tháng 6', orders: 25 },
];

export function AdminDashboardContent() {
  const { data: usersData } = useQuery({
    queryKey: ['admin', 'users', 1, 1],
    queryFn: () => adminApi.listUsers(1, 1),
  });

  const { data: productsData } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => adminApi.listProducts(),
  });

  const { data: ordersListData } = useQuery({
    queryKey: ['admin', 'orders', 1, 1],
    queryFn: () => adminApi.listOrders(1, 1),
  });

  const totalUsers = usersData?.pagination.total || 0;
  const totalProducts = productsData?.total || 0;
  const totalOrders = ordersListData?.total || 0;
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="flex h-full flex-col">
      <AdminHeader
        title="Dashboard"
        description="Tổng quan hệ thống và thống kê"
      />
      <div className="flex-1 space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="border-wds-accent/30 bg-wds-accent/10 hover:shadow-wds-accent/20 rounded-2xl border p-6 backdrop-blur-sm transition-shadow duration-200">
            <h3 className="text-wds-text/70 text-sm font-medium">Tổng Users</h3>
            <p className="text-wds-text mt-2 text-3xl font-bold">
              {totalUsers.toLocaleString()}
            </p>
          </div>
          <div className="border-wds-accent/30 bg-wds-accent/10 hover:shadow-wds-accent/20 rounded-2xl border p-6 backdrop-blur-sm transition-shadow duration-200">
            <h3 className="text-wds-text/70 text-sm font-medium">
              Tổng Products
            </h3>
            <p className="text-wds-text mt-2 text-3xl font-bold">
              {totalProducts.toLocaleString()}
            </p>
          </div>
          <div className="border-wds-accent/30 bg-wds-accent/10 hover:shadow-wds-accent/20 rounded-2xl border p-6 backdrop-blur-sm transition-shadow duration-200">
            <h3 className="text-wds-text/70 text-sm font-medium">
              Tổng Orders
            </h3>
            <p className="text-wds-text mt-2 text-3xl font-bold">
              {totalOrders.toLocaleString()}
            </p>
          </div>
          <div className="border-wds-accent/30 bg-wds-accent/10 hover:shadow-wds-accent/20 rounded-2xl border p-6 backdrop-blur-sm transition-shadow duration-200">
            <h3 className="text-wds-text/70 text-sm font-medium">Doanh thu</h3>
            <p className="text-wds-text mt-2 text-3xl font-bold">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(totalRevenue)}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AdminChart
            title="Doanh thu theo tháng"
            description="Biểu đồ doanh thu 6 tháng gần nhất"
            data={revenueData}
            dataKey="revenue"
            type="area"
          />
          <AdminChart
            title="Số lượng đơn hàng"
            description="Biểu đồ số lượng đơn hàng 6 tháng gần nhất"
            data={ordersData}
            dataKey="orders"
            type="bar"
          />
        </div>
      </div>
    </div>
  );
}

<script setup lang="ts">
import { computed } from 'vue';

import AdminChart from '@/components/admin/admin-chart.vue';
import AdminHeader from '@/components/admin/admin-header.vue';
import AdminLayout from '@/components/admin/admin-layout.vue';
import { useAdminOrders, useAdminProducts, useAdminUsers } from '@/lib/api/hooks/use-admin';
import { usePageMeta } from '@/lib/metadata';

usePageMeta({
  title: 'Admin Dashboard',
  description: 'Trang quản trị hệ thống WebDev Studios - Tổng quan và thống kê',
  path: '/admin',
});

// Mock chart data — apps/web dashboard-content.tsx keeps these mocked, mirrored as-is.
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

const { data: usersData } = useAdminUsers(1, 1);
const { data: productsData } = useAdminProducts();
const { data: ordersListData } = useAdminOrders(1, 1);

const totalUsers = computed(() => usersData.value?.total || 0);
const totalProducts = computed(() => productsData.value?.total || 0);
const totalOrders = computed(() => ordersListData.value?.total || 0);
const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
</script>

<template>
  <AdminLayout>
    <div class="flex h-full flex-col">
      <AdminHeader title="Dashboard" description="Tổng quan hệ thống và thống kê" />
      <div class="flex-1 space-y-6 p-6">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div
            class="border-wds-accent/30 bg-wds-accent/10 hover:shadow-wds-accent/20 rounded-2xl border p-6 backdrop-blur-sm transition-shadow duration-200"
          >
            <h3 class="text-wds-text/70 text-sm font-medium">Tổng Users</h3>
            <p class="text-wds-text mt-2 text-3xl font-bold">{{ totalUsers.toLocaleString() }}</p>
          </div>
          <div
            class="border-wds-accent/30 bg-wds-accent/10 hover:shadow-wds-accent/20 rounded-2xl border p-6 backdrop-blur-sm transition-shadow duration-200"
          >
            <h3 class="text-wds-text/70 text-sm font-medium">Tổng Products</h3>
            <p class="text-wds-text mt-2 text-3xl font-bold">
              {{ totalProducts.toLocaleString() }}
            </p>
          </div>
          <div
            class="border-wds-accent/30 bg-wds-accent/10 hover:shadow-wds-accent/20 rounded-2xl border p-6 backdrop-blur-sm transition-shadow duration-200"
          >
            <h3 class="text-wds-text/70 text-sm font-medium">Tổng Orders</h3>
            <p class="text-wds-text mt-2 text-3xl font-bold">{{ totalOrders.toLocaleString() }}</p>
          </div>
          <div
            class="border-wds-accent/30 bg-wds-accent/10 hover:shadow-wds-accent/20 rounded-2xl border p-6 backdrop-blur-sm transition-shadow duration-200"
          >
            <h3 class="text-wds-text/70 text-sm font-medium">Doanh thu</h3>
            <p class="text-wds-text mt-2 text-3xl font-bold">
              {{
                new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  totalRevenue,
                )
              }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AdminChart
            title="Doanh thu theo tháng"
            description="Biểu đồ doanh thu 6 tháng gần nhất"
            :data="revenueData"
            data-key="revenue"
            type="area"
          />
          <AdminChart
            title="Số lượng đơn hàng"
            description="Biểu đồ số lượng đơn hàng 6 tháng gần nhất"
            :data="ordersData"
            data-key="orders"
            type="bar"
          />
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

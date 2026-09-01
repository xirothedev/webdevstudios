<script setup lang="ts">
import { computed, ref } from 'vue';

import AdminDataTable from '@/components/admin/admin-data-table.vue';
import AdminHeader from '@/components/admin/admin-header.vue';
import AdminLayout from '@/components/admin/admin-layout.vue';
import TableActions from '@/components/admin/table-actions.vue';
import TableFilters from '@/components/admin/table-filters.vue';
import { useAdminOrders } from '@/lib/api/hooks/use-admin';
import { useUpdateOrderStatus } from '@/lib/api/hooks/use-orders';
import { formatDateTime } from '@/lib/date';
import type { OrderStatus } from '@/lib/api/orders';
import { usePageMeta } from '@/lib/metadata';
import { formatPrice } from '@/lib/utils';

usePageMeta({
  title: 'Quản lý Orders',
  description: 'Quản lý đơn hàng trong hệ thống WebDev Studios',
  path: '/admin/orders',
});

const columns = [
  { id: 'code', label: 'Order Code' },
  { id: 'customer', label: 'Customer' },
  { id: 'totalAmount', label: 'Total' },
  { id: 'status', label: 'Status' },
  { id: 'paymentStatus', label: 'Payment Status' },
  { id: 'createdAt', label: 'Created At' },
  { id: 'actions', label: 'Actions' },
];

const page = ref(1);
const limit = 10;
const statusFilter = ref<OrderStatus | undefined>();

const { data, isLoading } = useAdminOrders(page, limit, statusFilter);
const updateStatusMutation = useUpdateOrderStatus();

const statusClass = (status: string) =>
  status === 'DELIVERED'
    ? 'bg-green-500/20 text-green-400'
    : status === 'CANCELLED'
      ? 'bg-red-500/20 text-red-400'
      : 'bg-wds-accent/20 text-wds-accent';

const paymentStatusClass = (status: string) =>
  status === 'PAID'
    ? 'bg-green-500/20 text-green-400'
    : status === 'FAILED'
      ? 'bg-red-500/20 text-red-400'
      : 'bg-yellow-500/20 text-yellow-400';

const orders = computed(() => data.value?.rows || []);

function promptStatusUpdate(orderId: string) {
  const newStatus = window.prompt(
    'Enter new status (PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, CANCELLED, RETURNED):',
  );
  if (newStatus) {
    updateStatusMutation.mutate({ orderId, status: newStatus as OrderStatus });
  }
}
</script>

<template>
  <AdminLayout>
    <div class="flex h-full flex-col">
      <AdminHeader title="Orders Management" description="Quản lý đơn hàng trong hệ thống" />
      <div class="flex-1 space-y-4 p-6">
        <AdminDataTable
          v-model:page="page"
          :columns="columns"
          :rows="orders"
          :is-loading="!!isLoading"
          empty-message="No orders found"
          :limit="limit"
          :total="data?.total"
          subject="orders"
        >
          <template #filters>
            <TableFilters
              :filters="[
                {
                  id: 'status',
                  label: 'Status',
                  type: 'select',
                  options: [
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'CONFIRMED', label: 'Confirmed' },
                    { value: 'PROCESSING', label: 'Processing' },
                    { value: 'SHIPPING', label: 'Shipping' },
                    { value: 'DELIVERED', label: 'Delivered' },
                    { value: 'CANCELLED', label: 'Cancelled' },
                    { value: 'RETURNED', label: 'Returned' },
                  ],
                },
              ]"
              :filter-values="statusFilter ? { status: statusFilter } : {}"
              @update:filter-value="
                (_id, value) => (statusFilter = (value || undefined) as OrderStatus)
              "
              :on-clear="() => (statusFilter = undefined)"
            />
          </template>
          <template #cell-customer="{ row }">{{ row.shippingAddress.fullName }}</template>
          <template #cell-totalAmount="{ row }">{{ formatPrice(row.totalAmount) }}</template>
          <template #cell-status="{ row }">
            <span :class="`rounded-full px-2 py-1 text-xs font-medium ${statusClass(row.status)}`">
              {{ row.status }}
            </span>
          </template>
          <template #cell-paymentStatus="{ row }">
            <span
              :class="`rounded-full px-2 py-1 text-xs font-medium ${paymentStatusClass(row.paymentStatus)}`"
            >
              {{ row.paymentStatus }}
            </span>
          </template>
          <template #cell-createdAt="{ row }">{{ formatDateTime(row.createdAt) }}</template>
          <template #cell-actions="{ row }">
            <TableActions
              :custom-actions="[
                { label: 'Update Status', onClick: () => promptStatusUpdate(row.id) },
              ]"
            />
          </template>
        </AdminDataTable>
      </div>
    </div>
  </AdminLayout>
</template>

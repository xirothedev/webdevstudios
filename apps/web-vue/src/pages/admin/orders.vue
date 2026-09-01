<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, ref } from 'vue';

import AdminDataTable from '@/components/admin/admin-data-table.vue';
import AdminHeader from '@/components/admin/admin-header.vue';
import AdminLayout from '@/components/admin/admin-layout.vue';
import TableActions from '@/components/admin/table-actions.vue';
import TableFilters from '@/components/admin/table-filters.vue';
import { adminKeys, useAdminOrders } from '@/lib/api/hooks/use-admin';
import { formatDateTime } from '@/lib/date';
import { ordersApi, type OrderStatus } from '@/lib/api/orders';
import { usePageMeta } from '@/lib/metadata';
import { toast } from '@/lib/toast';
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
const queryClient = useQueryClient();

const updateStatusMutation = useMutation({
  mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
    ordersApi.updateOrderStatus(orderId, status),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'orders'] });
    toast.success('Order status updated successfully');
  },
  onError: () => {
    toast.error('Failed to update order status');
  },
});

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

const orders = computed(() => data.value?.orders || []);

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
          :columns="columns"
          :data="orders"
          :is-loading="!!isLoading"
          empty-message="No orders found"
          :page="page"
          :limit="limit"
          :pagination="data ? { total: data.total } : null"
          :next-disabled="!data?.orders || data.orders.length < limit"
          subject="orders"
          @update:page="page = $event"
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

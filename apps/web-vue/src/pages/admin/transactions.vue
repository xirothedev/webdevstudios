<script setup lang="ts">
import { computed, ref } from 'vue';

import AdminDataTable from '@/components/admin/admin-data-table.vue';
import AdminHeader from '@/components/admin/admin-header.vue';
import AdminLayout from '@/components/admin/admin-layout.vue';
import TableFilters from '@/components/admin/table-filters.vue';
import { useAdminTransactions } from '@/lib/api/hooks/use-admin';
import { formatDateTime } from '@/lib/date';
import type { PaymentTransactionStatus } from '@/lib/api/admin';
import { usePageMeta } from '@/lib/metadata';
import { formatPrice } from '@/lib/utils';

usePageMeta({
  title: 'Quản lý Transactions',
  description: 'Quản lý giao dịch thanh toán trong hệ thống WebDev Studios',
  path: '/admin/transactions',
});

const columns = [
  { id: 'transactionCode', label: 'Transaction Code' },
  { id: 'orderCode', label: 'Order Code' },
  { id: 'amount', label: 'Amount' },
  { id: 'status', label: 'Status' },
  { id: 'createdAt', label: 'Created At' },
];

const page = ref(1);
const limit = 10;
const statusFilter = ref<PaymentTransactionStatus | undefined>();

const { data, isLoading } = useAdminTransactions(page, limit, statusFilter);

const statusClass = (status: string) =>
  status === 'PAID'
    ? 'bg-green-500/20 text-green-400'
    : status === 'FAILED' || status === 'CANCELLED'
      ? 'bg-red-500/20 text-red-400'
      : 'bg-yellow-500/20 text-yellow-400';

const transactions = computed(() =>
  (data.value?.transactions || []).map((transaction) => ({
    ...transaction,
    orderCode: transaction.orderId || 'N/A',
  })),
);
</script>

<template>
  <AdminLayout>
    <div class="flex h-full flex-col">
      <AdminHeader
        title="Transactions Management"
        description="Quản lý giao dịch thanh toán trong hệ thống"
      />
      <div class="flex-1 space-y-4 p-6">
        <AdminDataTable
          :columns="columns"
          :data="transactions"
          :is-loading="!!isLoading"
          empty-message="No transactions found"
          :page="page"
          :limit="limit"
          :pagination="data?.pagination ?? null"
          subject="transactions"
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
                    { value: 'PAID', label: 'Paid' },
                    { value: 'CANCELLED', label: 'Cancelled' },
                    { value: 'EXPIRED', label: 'Expired' },
                    { value: 'FAILED', label: 'Failed' },
                  ],
                },
              ]"
              :filter-values="statusFilter ? { status: statusFilter } : {}"
              @update:filter-value="
                (_id, value) => (statusFilter = (value || undefined) as PaymentTransactionStatus)
              "
              :on-clear="() => (statusFilter = undefined)"
            />
          </template>
          <template #cell-amount="{ row }">{{ formatPrice(row.amount) }}</template>
          <template #cell-status="{ row }">
            <span :class="`rounded-full px-2 py-1 text-xs font-medium ${statusClass(row.status)}`">
              {{ row.status }}
            </span>
          </template>
          <template #cell-createdAt="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </AdminDataTable>
      </div>
    </div>
  </AdminLayout>
</template>

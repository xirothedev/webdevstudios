<script setup lang="ts">
import { computed, ref } from 'vue';

import AdminHeader from '@/components/admin/admin-header.vue';
import AdminLayout from '@/components/admin/admin-layout.vue';
import ColumnVisibilityToggle from '@/components/admin/column-visibility-toggle.vue';
import DataTable from '@/components/admin/data-table.vue';
import TableFilters from '@/components/admin/table-filters.vue';
import { formatDateTime, useAdminTransactions } from '@/components/admin/use-admin';
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
const visibleColumns = ref<string[]>(columns.map((c) => c.id));

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
        <div class="flex items-center justify-between">
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
          <ColumnVisibilityToggle v-model="visibleColumns" :columns="columns" />
        </div>
        <DataTable
          :columns="columns"
          :data="transactions"
          :visible-columns="visibleColumns"
          :is-loading="!!isLoading"
          empty-message="No transactions found"
        >
          <template #cell-amount="{ row }">{{ formatPrice(row.amount) }}</template>
          <template #cell-status="{ row }">
            <span :class="`rounded-full px-2 py-1 text-xs font-medium ${statusClass(row.status)}`">
              {{ row.status }}
            </span>
          </template>
          <template #cell-createdAt="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </DataTable>
        <div v-if="data" class="text-wds-text/70 flex items-center justify-between text-sm">
          <div>
            Showing {{ (page - 1) * limit + 1 }} to
            {{ Math.min(page * limit, data.pagination.total) }} of
            {{ data.pagination.total }} transactions
          </div>
          <div class="flex gap-2">
            <button
              class="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10 rounded-lg border px-4 py-2 disabled:opacity-50"
              :disabled="page === 1"
              @click="page = Math.max(1, page - 1)"
            >
              Previous
            </button>
            <button
              class="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10 rounded-lg border px-4 py-2 disabled:opacity-50"
              :disabled="page >= data.pagination.totalPages"
              @click="page = Math.min(data.pagination.totalPages, page + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import AdminHeader from '@/components/admin/admin-header.vue';
import AdminLayout from '@/components/admin/admin-layout.vue';
import ColumnVisibilityToggle from '@/components/admin/column-visibility-toggle.vue';
import DataTable from '@/components/admin/data-table.vue';
import TableActions from '@/components/admin/table-actions.vue';
import TableFilters from '@/components/admin/table-filters.vue';
import { formatDate, useAdminUsers } from '@/components/admin/use-admin';
import { adminApi } from '@/lib/api/admin';
import { usePageMeta } from '@/lib/metadata';
import { toast } from '@/lib/toast';

import type { UserRole } from '@/lib/api/users';

usePageMeta({
  title: 'Quản lý Users',
  description: 'Quản lý người dùng trong hệ thống WebDev Studios',
  path: '/admin/users',
});

const columns = [
  { id: 'id', label: 'ID' },
  { id: 'email', label: 'Email' },
  { id: 'fullName', label: 'Full Name' },
  { id: 'phone', label: 'Phone' },
  { id: 'role', label: 'Role' },
  { id: 'createdAt', label: 'Created At' },
  { id: 'actions', label: 'Actions' },
];

const page = ref(1);
const limit = 10;
const search = ref('');
const roleFilter = ref<UserRole | undefined>();
const visibleColumns = ref<string[]>(columns.map((c) => c.id));

const { data, isLoading, refetch } = useAdminUsers(page, limit, roleFilter);

const filteredData = computed(() => {
  if (!data.value?.users) return [];
  if (!search.value) return data.value.users;
  return data.value.users.filter(
    (user) =>
      user.email.toLowerCase().includes(search.value.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(search.value.toLowerCase()),
  );
});

async function handleDelete(userId: string) {
  if (!confirm('Bạn có chắc chắn muốn xóa user này?')) return;
  try {
    await adminApi.deleteUser(userId);
    toast.success('Đã xóa user thành công');
    refetch();
  } catch {
    toast.error('Xóa user thất bại');
  }
}
</script>

<template>
  <AdminLayout>
    <div class="flex h-full flex-col">
      <AdminHeader title="Users Management" description="Quản lý người dùng trong hệ thống" />
      <div class="flex-1 space-y-4 p-6">
        <div class="flex items-center justify-between">
          <TableFilters
            search-placeholder="Search by email or name..."
            :search="search"
            :filters="[
              {
                id: 'role',
                label: 'Role',
                type: 'select',
                options: [
                  { value: 'ADMIN', label: 'Admin' },
                  { value: 'CUSTOMER', label: 'Customer' },
                ],
              },
            ]"
            :filter-values="roleFilter ? { role: roleFilter } : {}"
            @update:search="search = $event"
            @update:filter-value="(_id, value) => (roleFilter = (value || undefined) as UserRole)"
            :on-clear="
              () => {
                search = '';
                roleFilter = undefined;
              }
            "
          />
          <ColumnVisibilityToggle v-model="visibleColumns" :columns="columns" />
        </div>
        <DataTable
          :columns="columns"
          :data="filteredData"
          :visible-columns="visibleColumns"
          :is-loading="!!isLoading"
          empty-message="No users found"
        >
          <template #cell-createdAt="{ row }">{{ formatDate(row.createdAt) }}</template>
          <template #cell-actions="{ row }">
            <TableActions
              :on-edit="() => toast.info('Edit functionality coming soon')"
              :on-delete="() => handleDelete(row.id)"
            />
          </template>
        </DataTable>
        <div v-if="data" class="text-wds-text/70 flex items-center justify-between text-sm">
          <div>
            Showing {{ (page - 1) * limit + 1 }} to
            {{ Math.min(page * limit, data.pagination.total) }} of {{ data.pagination.total }} users
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

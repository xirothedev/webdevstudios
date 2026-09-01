<script setup lang="ts">
import { computed, ref } from 'vue';

import AdminDataTable from '@/components/admin/admin-data-table.vue';
import AdminHeader from '@/components/admin/admin-header.vue';
import AdminLayout from '@/components/admin/admin-layout.vue';
import TableActions from '@/components/admin/table-actions.vue';
import TableFilters from '@/components/admin/table-filters.vue';
import { useAdminUsers, useDeleteAdminUser } from '@/lib/api/hooks/use-admin';
import { formatDate } from '@/lib/date';
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

const { data, isLoading } = useAdminUsers(page, limit, roleFilter);
const deleteUserMutation = useDeleteAdminUser();

const filteredData = computed(() => {
  if (!data.value?.rows) return [];
  if (!search.value) return data.value.rows;
  return data.value.rows.filter(
    (user) =>
      user.email.toLowerCase().includes(search.value.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(search.value.toLowerCase()),
  );
});

function handleDelete(userId: string) {
  if (!confirm('Bạn có chắc chắn muốn xóa user này?')) return;
  deleteUserMutation.mutate(userId);
}
</script>

<template>
  <AdminLayout>
    <div class="flex h-full flex-col">
      <AdminHeader title="Users Management" description="Quản lý người dùng trong hệ thống" />
      <div class="flex-1 space-y-4 p-6">
        <AdminDataTable
          v-model:page="page"
          :columns="columns"
          :rows="filteredData"
          :is-loading="!!isLoading"
          empty-message="No users found"
          :limit="limit"
          :total="data?.total"
          subject="users"
        >
          <template #filters>
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
          </template>
          <template #cell-createdAt="{ row }">{{ formatDate(row.createdAt) }}</template>
          <template #cell-actions="{ row }">
            <TableActions
              :on-edit="() => toast.info('Edit functionality coming soon')"
              :on-delete="() => handleDelete(row.id)"
            />
          </template>
        </AdminDataTable>
      </div>
    </div>
  </AdminLayout>
</template>

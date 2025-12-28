'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { ColumnVisibilityToggle } from '@/components/admin/ColumnVisibilityToggle';
import { DataTable } from '@/components/admin/DataTable';
import { TableActions } from '@/components/admin/TableActions';
import { TableFilters } from '@/components/admin/TableFilters';
import { adminApi } from '@/lib/api/admin';
import type { UserRole } from '@/lib/api/users';

const columns = [
  { id: 'id', label: 'ID' },
  { id: 'email', label: 'Email' },
  { id: 'fullName', label: 'Full Name' },
  { id: 'phone', label: 'Phone' },
  { id: 'role', label: 'Role' },
  { id: 'createdAt', label: 'Created At' },
  { id: 'actions', label: 'Actions' },
];

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>();
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.map((c) => c.id)
  );

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'users', page, limit, roleFilter],
    queryFn: () => adminApi.listUsers(page, limit, roleFilter),
  });

  const filteredData = useMemo(() => {
    if (!data?.users) return [];
    if (!search) return data.users;

    return data.users.filter(
      (user) =>
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data?.users, search]);

  const handleDelete = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa user này?')) return;

    try {
      await adminApi.deleteUser(userId);
      toast.success('Đã xóa user thành công');
      refetch();
    } catch {
      toast.error('Xóa user thất bại');
    }
  };

  const tableData = filteredData.map((user) => ({
    ...user,
    createdAt: format(new Date(user.createdAt), 'dd/MM/yyyy'),
    actions: (
      <TableActions
        onEdit={() => {
          // TODO: Implement edit
          toast.info('Edit functionality coming soon');
        }}
        onDelete={() => handleDelete(user.id)}
      />
    ),
  }));

  return (
    <div className="flex h-full flex-col">
      <AdminHeader
        title="Users Management"
        description="Quản lý người dùng trong hệ thống"
      />
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between">
          <TableFilters
            searchPlaceholder="Search by email or name..."
            onSearchChange={setSearch}
            filters={[
              {
                id: 'role',
                label: 'Role',
                type: 'select',
                options: [
                  { value: '', label: 'All Roles' },
                  { value: 'ADMIN', label: 'Admin' },
                  { value: 'CUSTOMER', label: 'Customer' },
                ],
                value: roleFilter || '',
                onChange: (value) =>
                  setRoleFilter(value ? (value as UserRole) : undefined),
              },
            ]}
            onClear={() => {
              setSearch('');
              setRoleFilter(undefined);
            }}
          />
          <ColumnVisibilityToggle
            columns={columns}
            visibleColumns={visibleColumns}
            onVisibilityChange={setVisibleColumns}
          />
        </div>
        <DataTable
          columns={columns}
          data={tableData}
          visibleColumns={visibleColumns}
          isLoading={isLoading}
          emptyMessage="No users found"
        />
        {data && (
          <div className="text-wds-text/70 flex items-center justify-between text-sm">
            <div>
              Showing {(page - 1) * limit + 1} to{' '}
              {Math.min(page * limit, data.pagination.total)} of{' '}
              {data.pagination.total} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10 rounded-lg border px-4 py-2 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(data.pagination.totalPages, p + 1))
                }
                disabled={page >= data.pagination.totalPages}
                className="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10 rounded-lg border px-4 py-2 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { ColumnVisibilityToggle } from '@/components/admin/ColumnVisibilityToggle';
import { DataTable } from '@/components/admin/DataTable';
import { TableActions } from '@/components/admin/TableActions';
import { TableFilters } from '@/components/admin/TableFilters';
import { adminApi } from '@/lib/api/admin';
import type { OrderStatus } from '@/lib/api/orders';
import { ordersApi } from '@/lib/api/orders';
import { formatPrice } from '@/lib/utils';

const columns = [
  { id: 'code', label: 'Order Code' },
  { id: 'customer', label: 'Customer' },
  { id: 'totalAmount', label: 'Total' },
  { id: 'status', label: 'Status' },
  { id: 'paymentStatus', label: 'Payment Status' },
  { id: 'createdAt', label: 'Created At' },
  { id: 'actions', label: 'Actions' },
];

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>();
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.map((c) => c.id)
  );
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', page, limit, statusFilter],
    queryFn: () => adminApi.listOrders(page, limit, statusFilter),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => ordersApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Order status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update order status');
    },
  });

  const tableData =
    data?.orders.map((order) => ({
      ...order,
      customer: order.shippingAddress.fullName,
      totalAmount: formatPrice(order.totalAmount),
      status: (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            order.status === 'DELIVERED'
              ? 'bg-green-500/20 text-green-400'
              : order.status === 'CANCELLED'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-wds-accent/20 text-wds-accent'
          }`}
        >
          {order.status}
        </span>
      ),
      paymentStatus: (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            order.paymentStatus === 'PAID'
              ? 'bg-green-500/20 text-green-400'
              : order.paymentStatus === 'FAILED'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-yellow-500/20 text-yellow-400'
          }`}
        >
          {order.paymentStatus}
        </span>
      ),
      createdAt: format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm'),
      actions: (
        <TableActions
          customActions={[
            {
              label: 'Update Status',
              onClick: () => {
                const newStatus = prompt(
                  'Enter new status (PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, CANCELLED, RETURNED):'
                );
                if (newStatus) {
                  updateStatusMutation.mutate({
                    orderId: order.id,
                    status: newStatus as OrderStatus,
                  });
                }
              },
            },
          ]}
        />
      ),
    })) || [];

  return (
    <div className="flex h-full flex-col">
      <AdminHeader
        title="Orders Management"
        description="Quản lý đơn hàng trong hệ thống"
      />
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between">
          <TableFilters
            filters={[
              {
                id: 'status',
                label: 'Status',
                type: 'select',
                options: [
                  { value: '', label: 'All Statuses' },
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'CONFIRMED', label: 'Confirmed' },
                  { value: 'PROCESSING', label: 'Processing' },
                  { value: 'SHIPPING', label: 'Shipping' },
                  { value: 'DELIVERED', label: 'Delivered' },
                  { value: 'CANCELLED', label: 'Cancelled' },
                  { value: 'RETURNED', label: 'Returned' },
                ],
                value: statusFilter || '',
                onChange: (value) =>
                  setStatusFilter(value ? (value as OrderStatus) : undefined),
              },
            ]}
            onClear={() => setStatusFilter(undefined)}
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
          emptyMessage="No orders found"
        />
        {data && (
          <div className="text-wds-text/70 flex items-center justify-between text-sm">
            <div>
              Showing {(page - 1) * limit + 1} to{' '}
              {Math.min(page * limit, data.total)} of {data.total} orders
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
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.orders || data.orders.length < limit}
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

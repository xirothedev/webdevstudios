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
import { format } from 'date-fns';
import { useState } from 'react';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { ColumnVisibilityToggle } from '@/components/admin/ColumnVisibilityToggle';
import { DataTable } from '@/components/admin/DataTable';
import { TableFilters } from '@/components/admin/TableFilters';
import { adminApi, type PaymentTransactionStatus } from '@/lib/api/admin';
import { formatPrice } from '@/lib/utils';

const columns = [
  { id: 'transactionCode', label: 'Transaction Code' },
  { id: 'orderCode', label: 'Order Code' },
  { id: 'amount', label: 'Amount' },
  { id: 'status', label: 'Status' },
  { id: 'createdAt', label: 'Created At' },
];

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<
    PaymentTransactionStatus | undefined
  >();
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.map((c) => c.id)
  );

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'transactions', page, limit, statusFilter],
    queryFn: () => adminApi.listTransactions(page, limit, statusFilter),
  });

  const tableData =
    data?.transactions.map((transaction) => ({
      ...transaction,
      orderCode: transaction.orderId || 'N/A',
      amount: formatPrice(transaction.amount),
      status: (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            transaction.status === 'PAID'
              ? 'bg-green-500/20 text-green-400'
              : transaction.status === 'FAILED' ||
                  transaction.status === 'CANCELLED'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-yellow-500/20 text-yellow-400'
          }`}
        >
          {transaction.status}
        </span>
      ),
      createdAt: format(new Date(transaction.createdAt), 'dd/MM/yyyy HH:mm'),
    })) || [];

  return (
    <div className="flex h-full flex-col">
      <AdminHeader
        title="Transactions Management"
        description="Quản lý giao dịch thanh toán trong hệ thống"
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
                  { value: 'PAID', label: 'Paid' },
                  { value: 'CANCELLED', label: 'Cancelled' },
                  { value: 'EXPIRED', label: 'Expired' },
                  { value: 'FAILED', label: 'Failed' },
                ],
                value: statusFilter || '',
                onChange: (value) =>
                  setStatusFilter(
                    value ? (value as PaymentTransactionStatus) : undefined
                  ),
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
          emptyMessage="No transactions found"
        />
        {data && (
          <div className="text-wds-text/70 flex items-center justify-between text-sm">
            <div>
              Showing {(page - 1) * limit + 1} to{' '}
              {Math.min(page * limit, data.pagination.total)} of{' '}
              {data.pagination.total} transactions
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

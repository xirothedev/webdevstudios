'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { OrderCard } from '@/components/orders/OrderCard';
import { OrdersEmpty } from '@/components/orders/OrdersEmpty';
import { Button } from '@/components/ui/button';
import { useCancelOrder, useSuspenseOrders } from '@/lib/api/hooks/use-orders';

export function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = useMemo(
    () => parseInt(searchParams.get('page') || '1', 10),
    [searchParams]
  );
  const limit = 10;

  // Fetch orders using Suspense Query
  const { data: ordersData } = useSuspenseOrders(page, limit);
  const { orders, total } = ordersData;

  // Cancel order mutation
  const cancelOrderMutation = useCancelOrder();

  const totalPages = Math.ceil(total / limit);

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPage === 1) {
        params.delete('page');
      } else {
        params.set('page', newPage.toString());
      }
      router.push(`/orders?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleCancel = useCallback(
    (orderId: string) => {
      if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
      cancelOrderMutation.mutate(orderId);
    },
    [cancelOrderMutation]
  );

  // Empty state
  if (orders.length === 0) {
    return <OrdersEmpty />;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-white">Đơn hàng của tôi</h1>
        <p className="text-white/60">Tổng cộng {total} đơn hàng</p>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-6">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onCancel={handleCancel}
            isCancelling={
              cancelOrderMutation.isPending &&
              cancelOrderMutation.variables === order.id
            }
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            variant="outline"
            size="sm"
            className="border-white/10 text-white hover:bg-white/10"
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                // Show first page, last page, current page, and pages around current
                if (p === 1 || p === totalPages) return true;
                if (Math.abs(p - page) <= 1) return true;
                return false;
              })
              .map((p, idx, arr) => {
                // Add ellipsis
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;

                return (
                  <div key={p} className="flex items-center gap-1">
                    {showEllipsis && (
                      <span className="px-2 text-white/60">...</span>
                    )}
                    <Button
                      onClick={() => handlePageChange(p)}
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                      className={
                        p === page
                          ? 'bg-wds-accent hover:bg-wds-accent/90 text-black'
                          : 'border-white/10 text-white hover:bg-white/10'
                      }
                    >
                      {p}
                    </Button>
                  </div>
                );
              })}
          </div>

          <Button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            variant="outline"
            size="sm"
            className="border-white/10 text-white hover:bg-white/10"
          >
            Sau
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

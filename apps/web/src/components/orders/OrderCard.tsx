'use client';

import { ChevronRight, X } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Order, OrderStatus, PaymentStatus } from '@/lib/api/orders';
import { formatPrice } from '@/lib/utils';

interface OrderCardProps {
  order: Order;
  onCancel?: (orderId: string) => void;
  isCancelling?: boolean;
}

const getStatusConfig = (status: OrderStatus) => {
  const configs: Record<OrderStatus, { text: string; className: string }> = {
    PENDING: {
      text: 'Chờ thanh toán',
      className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    },
    CONFIRMED: {
      text: 'Đã xác nhận',
      className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    PROCESSING: {
      text: 'Đang đóng gói',
      className: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
    SHIPPING: {
      text: 'Đang giao',
      className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    },
    DELIVERED: {
      text: 'Đã giao',
      className: 'bg-green-500/20 text-green-400 border-green-500/30',
    },
    CANCELLED: {
      text: 'Đã hủy',
      className: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    RETURNED: {
      text: 'Đã trả hàng',
      className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    },
  };
  return configs[status];
};

const getPaymentStatusConfig = (status: PaymentStatus) => {
  const configs: Record<PaymentStatus, { text: string; className: string }> = {
    PENDING: {
      text: 'Chờ thanh toán',
      className: 'text-yellow-400',
    },
    PAID: {
      text: 'Đã thanh toán',
      className: 'text-green-400',
    },
    FAILED: {
      text: 'Thanh toán thất bại',
      className: 'text-red-400',
    },
    REFUNDED: {
      text: 'Đã hoàn tiền',
      className: 'text-gray-400',
    },
  };
  return configs[status];
};

export function OrderCard({ order, onCancel, isCancelling }: OrderCardProps) {
  const statusConfig = getStatusConfig(order.status);
  const paymentStatusConfig = getPaymentStatusConfig(order.paymentStatus);
  const canCancel =
    order.status === 'PENDING' && order.paymentStatus !== 'PAID';
  const displayedItems = order.items.slice(0, 3);
  const hasMoreItems = order.items.length > 3;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="group hover:border-wds-accent/30 flex h-full flex-col rounded-xl border border-white/10 bg-white/5 p-6 transition-all">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <Link
              href={`/orders/${order.id}`}
              className="hover:text-wds-accent text-lg font-semibold text-white transition-colors"
            >
              {order.code}
            </Link>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusConfig.className}`}
            >
              {statusConfig.text}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
            <span>Ngày đặt: {formatDate(order.createdAt)}</span>
            <span className={paymentStatusConfig.className}>
              {paymentStatusConfig.text}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-wds-accent text-lg font-bold">
            {formatPrice(order.totalAmount)}₫
          </p>
          <p className="text-xs text-white/60">{order.items.length} sản phẩm</p>
        </div>
      </div>

      {/* Items Preview */}
      <div className="mb-4 space-y-2">
        {displayedItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                {item.productName}
              </p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-white/60">
                {item.size && <span>Size: {item.size}</span>}
                <span>× {item.quantity}</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-white">
              {formatPrice(item.subtotal)}₫
            </p>
          </div>
        ))}
        {hasMoreItems && (
          <p className="text-center text-xs text-white/60">
            +{order.items.length - 3} sản phẩm khác
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <Link
          href={`/orders/${order.id}`}
          className="text-wds-accent hover:text-wds-accent/80 inline-flex items-center gap-1 text-sm font-medium transition-colors"
        >
          Xem chi tiết
          <ChevronRight className="h-4 w-4" />
        </Link>
        {canCancel && onCancel && (
          <Button
            onClick={() => onCancel(order.id)}
            disabled={isCancelling}
            variant="outline"
            size="sm"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            {isCancelling ? (
              <>
                <X className="h-4 w-4" />
                Đang hủy...
              </>
            ) : (
              <>
                <X className="h-4 w-4" />
                Hủy đơn
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

'use client';

import { useParams } from 'next/navigation';

import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useCancelOrder, useOrder } from '@/lib/api/hooks/use-orders';
import { formatPrice } from '@/lib/utils';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  // Fetch order data
  const { data: order, isLoading, error: orderError } = useOrder(orderId);

  // Cancel order mutation
  const cancelOrderMutation = useCancelOrder();

  const handleCancel = () => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;

    cancelOrderMutation.mutate(orderId);
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: 'Chờ thanh toán',
      CONFIRMED: 'Đã xác nhận',
      PROCESSING: 'Đang đóng gói',
      SHIPPING: 'Đang giao',
      DELIVERED: 'Đã giao',
      CANCELLED: 'Đã hủy',
      RETURNED: 'Đã trả hàng',
    };
    return statusMap[status] || status;
  };

  if (isLoading) {
    return (
      <div className="bg-wds-background text-wds-text flex min-h-screen items-center justify-center">
        <div className="text-white">Đang tải...</div>
      </div>
    );
  }

  if (orderError || !order) {
    const errorMessage =
      orderError instanceof Error
        ? orderError.message
        : 'Không tìm thấy đơn hàng';
    return (
      <div className="bg-wds-background text-wds-text flex min-h-screen items-center justify-center">
        <div className="text-white">{errorMessage}</div>
      </div>
    );
  }

  const canCancel = order.status === 'PENDING';

  return (
    <div className="bg-wds-background text-wds-text min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-white">
              Đơn hàng {order.code}
            </h1>
            <p className="text-white/60">
              Trạng thái:{' '}
              <span className="font-semibold text-white">
                {getStatusText(order.status)}
              </span>
            </p>
          </div>

          {/* Order Items */}
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">Sản phẩm</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {item.productName}
                    </p>
                    {item.size && (
                      <p className="text-sm text-white/60">Size: {item.size}</p>
                    )}
                    <p className="text-sm text-white/60">
                      Số lượng: {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-white">
                    {formatPrice(item.subtotal)}₫
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">
              Địa chỉ giao hàng
            </h2>
            <div className="space-y-1 text-white/80">
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress.ward}, {order.shippingAddress.district},{' '}
                {order.shippingAddress.city}
              </p>
              <p>Mã bưu điện: {order.shippingAddress.postalCode}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">
              Tóm tắt đơn hàng
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-white/80">
                <span>Tạm tính:</span>
                <span>
                  {formatPrice(
                    order.totalAmount - order.shippingFee + order.discountValue
                  )}
                  ₫
                </span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Phí vận chuyển:</span>
                <span>
                  {order.shippingFee === 0
                    ? 'Miễn phí'
                    : formatPrice(order.shippingFee) + '₫'}
                </span>
              </div>
              {order.discountValue > 0 && (
                <div className="flex justify-between text-white/80">
                  <span>Giảm giá:</span>
                  <span>-{formatPrice(order.discountValue)}₫</span>
                </div>
              )}
              <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold text-white">
                <span>Tổng cộng:</span>
                <span>{formatPrice(order.totalAmount)}₫</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {canCancel && (
            <Button
              onClick={handleCancel}
              disabled={cancelOrderMutation.isPending}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              {cancelOrderMutation.isPending ? 'Đang hủy...' : 'Hủy đơn hàng'}
            </Button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/lib/api/hooks/use-orders';
import { useCreatePaymentLink } from '@/lib/api/hooks/use-payments';
import { formatPrice } from '@/lib/utils';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const { data: order, isLoading: isLoadingOrder } = useOrder(orderId);
  const createPaymentLinkMutation = useCreatePaymentLink();
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  // Load payment URL from localStorage or create new one
  useEffect(() => {
    if (!order) return;

    // Check localStorage for saved payment URL
    const savedPaymentUrl = localStorage.getItem(`paymentUrl_${orderId}`);
    if (savedPaymentUrl) {
      setPaymentUrl(savedPaymentUrl);
      return;
    }

    // Create payment link if order is pending
    if (order.paymentStatus === 'PENDING' && order.status === 'PENDING') {
      setIsLoadingPayment(true);
      createPaymentLinkMutation.mutate(
        { orderId: order.id },
        {
          onSuccess: (data) => {
            setPaymentUrl(data.paymentUrl);
            localStorage.setItem(`paymentUrl_${orderId}`, data.paymentUrl);
            setIsLoadingPayment(false);
          },
          onError: () => {
            setIsLoadingPayment(false);
          },
        }
      );
    }
  }, [order, orderId, createPaymentLinkMutation]);

  // Redirect if order is already paid
  useEffect(() => {
    if (order && order.paymentStatus === 'PAID') {
      router.push(`/orders/${orderId}`);
    }
  }, [order, orderId, router]);

  if (isLoadingOrder) {
    return (
      <div className="bg-wds-background text-wds-text flex min-h-screen items-center justify-center">
        <div className="text-white">Đang tải...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-wds-background text-wds-text flex min-h-screen items-center justify-center">
        <div className="text-white">Không tìm thấy đơn hàng</div>
      </div>
    );
  }

  const handleRedirectToPayOS = () => {
    if (paymentUrl) {
      window.location.href = paymentUrl;
    }
  };

  return (
    <div className="bg-wds-background text-wds-text min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-4xl px-6">
          <h1 className="mb-8 text-3xl font-bold text-white">
            Thanh toán đơn hàng {order.code}
          </h1>

          {/* Order Summary */}
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">
              Tóm tắt đơn hàng
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm text-white/80"
                >
                  <span>
                    {item.productName}
                    {item.size && ` (${item.size})`} x {item.quantity}
                  </span>
                  <span>{formatPrice(item.subtotal)}₫</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-white/10 pt-3 text-white/80">
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
              <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold text-white">
                <span>Tổng cộng:</span>
                <span>{formatPrice(order.totalAmount)}₫</span>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">
              Chọn phương thức thanh toán
            </h2>

            {isLoadingPayment ? (
              <div className="text-center text-white/60">
                Đang tạo liên kết thanh toán...
              </div>
            ) : paymentUrl ? (
              <div className="space-y-4">
                <Button
                  onClick={handleRedirectToPayOS}
                  className="bg-wds-accent hover:bg-wds-accent/90 h-14 w-full font-semibold text-black"
                >
                  Thanh toán với PayOS
                </Button>
                <p className="text-center text-sm text-white/60">
                  Bạn sẽ được chuyển đến trang thanh toán của PayOS
                </p>
              </div>
            ) : (
              <div className="text-center text-white/60">
                Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.
              </div>
            )}

            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => router.push(`/orders/${orderId}`)}
                className="border-white/10 text-white/80 hover:bg-white/5"
              >
                Quay lại đơn hàng
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

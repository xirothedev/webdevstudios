'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/lib/api/hooks/use-orders';

export default function PaymentReturnPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const { data: ordersData, refetch } = useOrders(1, 10);

  useEffect(() => {
    // Check payment status by refetching orders
    const checkPaymentStatus = async () => {
      await refetch();
      setIsChecking(false);

      // Find the most recent order
      const recentOrder = ordersData?.orders[0];
      if (recentOrder) {
        // Clear localStorage
        localStorage.removeItem('pendingOrderId');
        localStorage.removeItem(`paymentUrl_${recentOrder.id}`);

        // Redirect to order detail page
        setTimeout(() => {
          router.push(`/orders/${recentOrder.id}`);
        }, 2000);
      }
    };

    checkPaymentStatus();
  }, [refetch, ordersData, router]);

  return (
    <div className="bg-wds-background text-wds-text min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          {isChecking ? (
            <>
              <h1 className="mb-4 text-3xl font-bold text-white">
                Đang xác nhận thanh toán...
              </h1>
              <p className="text-white/60">
                Vui lòng đợi trong giây lát, chúng tôi đang kiểm tra trạng thái
                thanh toán của bạn.
              </p>
            </>
          ) : (
            <>
              <h1 className="mb-4 text-3xl font-bold text-white">
                Thanh toán thành công!
              </h1>
              <p className="mb-8 text-white/60">
                Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đang được xử lý.
              </p>
              <Button
                onClick={() => {
                  const recentOrder = ordersData?.orders[0];
                  if (recentOrder) {
                    router.push(`/orders/${recentOrder.id}`);
                  } else {
                    router.push('/orders');
                  }
                }}
                className="bg-wds-accent hover:bg-wds-accent/90 font-semibold text-black"
              >
                Xem đơn hàng
              </Button>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

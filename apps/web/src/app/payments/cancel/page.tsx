'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';

export default function PaymentCancelPage() {
  const router = useRouter();

  useEffect(() => {
    // Get pending order ID from localStorage
    const pendingOrderId = localStorage.getItem('pendingOrderId');
    if (pendingOrderId) {
      // Clear localStorage
      localStorage.removeItem('pendingOrderId');
      localStorage.removeItem(`paymentUrl_${pendingOrderId}`);

      // Redirect to order detail page after 3 seconds
      setTimeout(() => {
        router.push(`/orders/${pendingOrderId}`);
      }, 3000);
    }
  }, [router]);

  return (
    <div className="bg-wds-background text-wds-text min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h1 className="mb-4 text-3xl font-bold text-white">
            Thanh toán đã bị hủy
          </h1>
          <p className="mb-8 text-white/60">
            Bạn đã hủy quá trình thanh toán. Đơn hàng của bạn vẫn được lưu và
            bạn có thể thanh toán lại bất cứ lúc nào.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => {
                const pendingOrderId = localStorage.getItem('pendingOrderId');
                if (pendingOrderId) {
                  router.push(`/orders/${pendingOrderId}`);
                } else {
                  router.push('/orders');
                }
              }}
              className="bg-wds-accent hover:bg-wds-accent/90 font-semibold text-black"
            >
              Xem đơn hàng
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/shop')}
              className="border-white/10 text-white/80 hover:bg-white/5"
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

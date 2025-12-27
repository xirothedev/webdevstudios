'use client';

import { Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

export function OrdersEmpty() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-6 rounded-full bg-white/5 p-6">
        <Package className="h-16 w-16 text-white/20" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-white">
        Bạn chưa có đơn hàng nào
      </h2>
      <p className="mb-8 text-center text-white/60">
        Hãy khám phá các sản phẩm của chúng tôi và tạo đơn hàng đầu tiên
      </p>
      <Button
        onClick={() => router.push('/shop')}
        className="bg-wds-accent hover:bg-wds-accent/90 font-semibold text-black"
      >
        Tiếp tục mua sắm
      </Button>
    </div>
  );
}

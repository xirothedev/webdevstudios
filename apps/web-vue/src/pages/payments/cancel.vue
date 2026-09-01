<script setup lang="ts">
// Port of apps/web src/app/payments/cancel/page.tsx. Navbar/Footer come from the App.vue shell.
import { useRouter } from 'vue-router';

import { Button } from '@/components/ui/button.vue';

const router = useRouter();

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

// Mirrors apps/web: the button re-reads localStorage on click (already cleared above →
// falls back to /orders whenever a pending order existed). Quirk preserved.
function viewOrder() {
  const id = localStorage.getItem('pendingOrderId');
  if (id) {
    router.push(`/orders/${id}`);
  } else {
    router.push('/orders');
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-6 pt-10 pb-20 text-center">
    <h1 class="mb-4 text-3xl font-bold text-white">Thanh toán đã bị hủy</h1>
    <p class="mb-8 text-white/60">
      Bạn đã hủy quá trình thanh toán. Đơn hàng của bạn vẫn được lưu và bạn có thể thanh toán lại
      bất cứ lúc nào.
    </p>
    <div class="flex justify-center gap-4">
      <Button
        @click="viewOrder"
        class="bg-wds-accent hover:bg-wds-accent/90 font-semibold text-black"
      >
        Xem đơn hàng
      </Button>
      <Button
        variant="outline"
        @click="router.push('/shop')"
        class="border-white/10 text-white/80 hover:bg-white/5"
      >
        Tiếp tục mua sắm
      </Button>
    </div>
  </div>
</template>

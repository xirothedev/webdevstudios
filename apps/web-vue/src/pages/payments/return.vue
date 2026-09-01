<script setup lang="ts">
// Port of apps/web src/app/payments/return/page.tsx. Navbar/Footer come from the App.vue shell.
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Button } from '@/components/ui/button.vue';
import { usePendingOrder } from '@/composables/use-pending-order';
import { useOrders } from '@/lib/api/hooks/use-orders';

const router = useRouter();
const pendingOrder = usePendingOrder();
const isChecking = ref(true);
const { data: ordersData, refetch } = useOrders(1, 10);

// PayOS redirects here with query params; apps/web ignores them and verifies by
// refetching the orders list, then reads the most recent order. Mirrored exactly.
refetch().then(({ data }) => {
  isChecking.value = false;

  // Find the most recent order
  const recentOrder = data?.orders[0];
  if (recentOrder) {
    // Clear localStorage
    pendingOrder.clearFor(recentOrder.id);

    // Redirect to order detail page
    setTimeout(() => {
      router.push(`/orders/${recentOrder.id}`);
    }, 2000);
  }
});

function viewOrder() {
  const recentOrder = ordersData.value?.orders[0];
  if (recentOrder) {
    router.push(`/orders/${recentOrder.id}`);
  } else {
    router.push('/orders');
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-6 pt-10 pb-20 text-center">
    <template v-if="isChecking">
      <h1 class="mb-4 text-3xl font-bold text-white">Đang xác nhận thanh toán...</h1>
      <p class="text-white/60">
        Vui lòng đợi trong giây lát, chúng tôi đang kiểm tra trạng thái thanh toán của bạn.
      </p>
    </template>
    <template v-else>
      <h1 class="mb-4 text-3xl font-bold text-white">Thanh toán thành công!</h1>
      <p class="mb-8 text-white/60">Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đang được xử lý.</p>
      <Button
        @click="viewOrder"
        class="bg-wds-accent hover:bg-wds-accent/90 font-semibold text-black"
      >
        Xem đơn hàng
      </Button>
    </template>
  </div>
</template>

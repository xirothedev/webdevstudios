<script setup lang="ts">
// Port of apps/web src/app/payments/[orderId]/page.tsx. Navbar/Footer come from the App.vue shell.
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Button } from '@/components/ui/button.vue';
import { usePendingOrder } from '@/composables/use-pending-order';
import { useOrder } from '@/lib/api/hooks/use-orders';
import { useCreatePaymentLink } from '@/lib/api/hooks/use-payments';
import { formatPrice } from '@/lib/utils';

const route = useRoute();
const router = useRouter();
const pendingOrder = usePendingOrder();
const orderId = String(route.params.orderId);

const { data: order, isLoading: isLoadingOrder } = useOrder(orderId);
const createPaymentLink = useCreatePaymentLink();
const paymentUrl = ref<string | null>(pendingOrder.paymentUrl(orderId));
const isLoadingPayment = createPaymentLink.isPending;

// Create payment link if the order is pending and no URL was saved yet
watch(
  [order, paymentUrl],
  ([order]) => {
    if (!order || paymentUrl.value) return;

    if (order.paymentStatus === 'PENDING' && order.status === 'PENDING') {
      createPaymentLink.mutate(
        { orderId: order.id },
        {
          onSuccess: (data) => {
            paymentUrl.value = data.paymentUrl;
            pendingOrder.savePaymentUrl(orderId, data.paymentUrl);
          },
        },
      );
    }
  },
  { immediate: true },
);

// Redirect if order is already paid
watch(order, (order) => {
  if (order && order.paymentStatus === 'PAID') {
    router.push(`/orders/${orderId}`);
  }
});

function handleRedirectToPayOS() {
  if (paymentUrl.value) {
    window.location.href = paymentUrl.value;
  }
}
</script>

<template>
  <div v-if="isLoadingOrder" class="flex min-h-[60vh] items-center justify-center">
    <div class="text-white">Đang tải...</div>
  </div>

  <div v-else-if="!order" class="flex min-h-[60vh] items-center justify-center">
    <div class="text-white">Không tìm thấy đơn hàng</div>
  </div>

  <div v-else class="mx-auto max-w-4xl px-6 pt-10 pb-20">
    <h1 class="mb-8 text-3xl font-bold text-white">Thanh toán đơn hàng {{ order.code }}</h1>

    <!-- Order Summary -->
    <div class="mb-6 rounded-xl border border-white/10 bg-white/5 p-6">
      <h2 class="mb-4 text-xl font-bold text-white">Tóm tắt đơn hàng</h2>
      <div class="space-y-3">
        <div
          v-for="item in order.items"
          :key="item.id"
          class="flex justify-between text-sm text-white/80"
        >
          <span
            >{{ item.productName }}{{ item.size ? ` (${item.size})` : '' }} x
            {{ item.quantity }}</span
          >
          <span>{{ formatPrice(item.subtotal) }}₫</span>
        </div>
        <div class="flex justify-between border-t border-white/10 pt-3 text-white/80">
          <span>Tạm tính:</span>
          <span
            >{{ formatPrice(order.totalAmount - order.shippingFee + order.discountValue) }}₫</span
          >
        </div>
        <div class="flex justify-between text-white/80">
          <span>Phí vận chuyển:</span>
          <span>{{
            order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee) + '₫'
          }}</span>
        </div>
        <div
          class="flex justify-between border-t border-white/10 pt-3 text-lg font-bold text-white"
        >
          <span>Tổng cộng:</span>
          <span>{{ formatPrice(order.totalAmount) }}₫</span>
        </div>
      </div>
    </div>

    <!-- Payment Options -->
    <div class="rounded-xl border border-white/10 bg-white/5 p-6">
      <h2 class="mb-4 text-xl font-bold text-white">Chọn phương thức thanh toán</h2>

      <div v-if="isLoadingPayment" class="text-center text-white/60">
        Đang tạo liên kết thanh toán...
      </div>
      <div v-else-if="paymentUrl" class="space-y-4">
        <Button
          @click="handleRedirectToPayOS"
          class="bg-wds-accent hover:bg-wds-accent/90 h-14 w-full font-semibold text-black"
        >
          Thanh toán với PayOS
        </Button>
        <p class="text-center text-sm text-white/60">
          Bạn sẽ được chuyển đến trang thanh toán của PayOS
        </p>
      </div>
      <div v-else class="text-center text-white/60">
        Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.
      </div>

      <div class="mt-6 text-center">
        <Button
          variant="outline"
          @click="router.push(`/orders/${orderId}`)"
          class="border-white/10 text-white/80 hover:bg-white/5"
        >
          Quay lại đơn hàng
        </Button>
      </div>
    </div>
  </div>
</template>

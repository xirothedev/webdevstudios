<script setup lang="ts">
// Port of apps/web src/app/orders/[id]/page.tsx. Navbar/Footer come from the App.vue shell.
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { Button } from '@/components/ui/button.vue';
import { useCancelOrder, useOrder } from '@/lib/api/hooks/use-orders';
import { formatPrice } from '@/lib/utils';

const route = useRoute();
const orderId = computed(() => String(route.params.id));

const { data: order, isLoading, error: orderError } = useOrder(orderId);
const cancelOrder = useCancelOrder();

const STATUS_TEXT: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang đóng gói',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
  RETURNED: 'Đã trả hàng',
};

const canCancel = computed(() => order.value?.status === 'PENDING');

const errorMessage = computed(() =>
  orderError.value instanceof Error ? orderError.value.message : 'Không tìm thấy đơn hàng',
);

function handleCancel() {
  if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
  cancelOrder.mutate(orderId.value);
}
</script>

<template>
  <div v-if="isLoading" class="flex min-h-[60vh] items-center justify-center">
    <div class="text-white">Đang tải...</div>
  </div>

  <div v-else-if="orderError || !order" class="flex min-h-[60vh] items-center justify-center">
    <div class="text-white">{{ errorMessage }}</div>
  </div>

  <div v-else class="mx-auto max-w-4xl px-6 pt-10 pb-20">
    <div class="mb-8">
      <h1 class="mb-2 text-3xl font-bold text-white">Đơn hàng {{ order.code }}</h1>
      <p class="text-white/60">
        Trạng thái:
        <span class="font-semibold text-white">{{
          STATUS_TEXT[order.status] || order.status
        }}</span>
      </p>
    </div>

    <div class="mb-6 rounded-xl border border-white/10 bg-white/5 p-6">
      <h2 class="mb-4 text-xl font-bold text-white">Sản phẩm</h2>
      <div class="space-y-4">
        <div v-for="item in order.items" :key="item.id" class="flex items-center justify-between">
          <div>
            <p class="font-semibold text-white">{{ item.productName }}</p>
            <p v-if="item.size" class="text-sm text-white/60">Size: {{ item.size }}</p>
            <p class="text-sm text-white/60">Số lượng: {{ item.quantity }}</p>
          </div>
          <p class="font-bold text-white">{{ formatPrice(item.subtotal) }}₫</p>
        </div>
      </div>
    </div>

    <div class="mb-6 rounded-xl border border-white/10 bg-white/5 p-6">
      <h2 class="mb-4 text-xl font-bold text-white">Địa chỉ giao hàng</h2>
      <div class="space-y-1 text-white/80">
        <p>{{ order.shippingAddress.fullName }}</p>
        <p>{{ order.shippingAddress.phone }}</p>
        <p>{{ order.shippingAddress.addressLine1 }}</p>
        <p v-if="order.shippingAddress.addressLine2">{{ order.shippingAddress.addressLine2 }}</p>
        <p>
          {{ order.shippingAddress.ward }}, {{ order.shippingAddress.district }},
          {{ order.shippingAddress.city }}
        </p>
        <p>Mã bưu điện: {{ order.shippingAddress.postalCode }}</p>
      </div>
    </div>

    <div class="mb-6 rounded-xl border border-white/10 bg-white/5 p-6">
      <h2 class="mb-4 text-xl font-bold text-white">Tóm tắt đơn hàng</h2>
      <div class="space-y-3">
        <div class="flex justify-between text-white/80">
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
        <div v-if="order.discountValue > 0" class="flex justify-between text-white/80">
          <span>Giảm giá:</span>
          <span>-{{ formatPrice(order.discountValue) }}₫</span>
        </div>
        <div
          class="flex justify-between border-t border-white/10 pt-3 text-lg font-bold text-white"
        >
          <span>Tổng cộng:</span>
          <span>{{ formatPrice(order.totalAmount) }}₫</span>
        </div>
      </div>
    </div>

    <Button
      v-if="canCancel"
      :disabled="cancelOrder.isPending.value"
      variant="outline"
      class="border-red-500/50 text-red-400 hover:bg-red-500/10"
      @click="handleCancel"
    >
      {{ cancelOrder.isPending.value ? 'Đang hủy...' : 'Hủy đơn hàng' }}
    </Button>
  </div>
</template>

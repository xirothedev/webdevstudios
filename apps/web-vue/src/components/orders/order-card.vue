<script setup lang="ts">
// Port of apps/web src/components/orders/OrderCard.tsx
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { ChevronRight, X } from 'lucide-vue-next';

import { Button } from '@/components/ui/button.vue';
import type { Order, OrderStatus, PaymentStatus } from '@/lib/api/orders';
import { formatPrice } from '@/lib/utils';

const props = defineProps<{ order: Order; isCancelling?: boolean }>();
const emit = defineEmits<{ cancel: [orderId: string] }>();

const STATUS_CONFIG: Record<OrderStatus, { text: string; className: string }> = {
  PENDING: {
    text: 'Chờ thanh toán',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  CONFIRMED: { text: 'Đã xác nhận', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  PROCESSING: {
    text: 'Đang đóng gói',
    className: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  SHIPPING: { text: 'Đang giao', className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  DELIVERED: { text: 'Đã giao', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  CANCELLED: { text: 'Đã hủy', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  RETURNED: { text: 'Đã trả hàng', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

const PAYMENT_CONFIG: Record<PaymentStatus, { text: string; className: string }> = {
  PENDING: { text: 'Chờ thanh toán', className: 'text-yellow-400' },
  PAID: { text: 'Đã thanh toán', className: 'text-green-400' },
  FAILED: { text: 'Thanh toán thất bại', className: 'text-red-400' },
  REFUNDED: { text: 'Đã hoàn tiền', className: 'text-gray-400' },
};

const statusConfig = computed(() => STATUS_CONFIG[props.order.status]);
const paymentStatusConfig = computed(() => PAYMENT_CONFIG[props.order.paymentStatus]);
const canCancel = computed(
  () => props.order.status === 'PENDING' && props.order.paymentStatus !== 'PAID',
);
const displayedItems = computed(() => props.order.items.slice(0, 3));

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
</script>

<template>
  <div
    class="group hover:border-wds-accent/30 flex h-full flex-col rounded-xl border border-white/10 bg-white/5 p-6 transition-all"
  >
    <div class="mb-4 flex items-start justify-between">
      <div class="flex-1">
        <div class="mb-2 flex items-center gap-3">
          <RouterLink
            :to="`/orders/${order.id}`"
            class="hover:text-wds-accent text-lg font-semibold text-white transition-colors"
            >{{ order.code }}</RouterLink
          >
          <span
            class="rounded-full border px-2.5 py-0.5 text-xs font-medium"
            :class="statusConfig.className"
            >{{ statusConfig.text }}</span
          >
        </div>
        <div class="flex flex-wrap items-center gap-4 text-sm text-white/60">
          <span>Ngày đặt: {{ formatDate(order.createdAt) }}</span>
          <span :class="paymentStatusConfig.className">{{ paymentStatusConfig.text }}</span>
        </div>
      </div>
      <div class="text-right">
        <p class="text-wds-accent text-lg font-bold">{{ formatPrice(order.totalAmount) }}₫</p>
        <p class="text-xs text-white/60">{{ order.items.length }} sản phẩm</p>
      </div>
    </div>

    <div class="mb-4 space-y-2">
      <div
        v-for="item in displayedItems"
        :key="item.id"
        class="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
      >
        <div class="flex-1">
          <p class="text-sm font-medium text-white">{{ item.productName }}</p>
          <div class="mt-0.5 flex items-center gap-2 text-xs text-white/60">
            <span v-if="item.size">Size: {{ item.size }}</span>
            <span>× {{ item.quantity }}</span>
          </div>
        </div>
        <p class="text-sm font-semibold text-white">{{ formatPrice(item.subtotal) }}₫</p>
      </div>
      <p v-if="order.items.length > 3" class="text-center text-xs text-white/60">
        +{{ order.items.length - 3 }} sản phẩm khác
      </p>
    </div>

    <div class="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
      <RouterLink
        :to="`/orders/${order.id}`"
        class="text-wds-accent hover:text-wds-accent/80 inline-flex items-center gap-1 text-sm font-medium transition-colors"
      >
        Xem chi tiết
        <ChevronRight class="h-4 w-4" />
      </RouterLink>
      <Button
        v-if="canCancel"
        :disabled="isCancelling"
        variant="outline"
        size="sm"
        class="border-red-500/50 text-red-400 hover:bg-red-500/10"
        @click="emit('cancel', order.id)"
      >
        <X class="h-4 w-4" />
        {{ isCancelling ? 'Đang hủy...' : 'Hủy đơn' }}
      </Button>
    </div>
  </div>
</template>

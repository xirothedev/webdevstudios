<script setup lang="ts">
// Port of apps/web src/app/orders (page + OrdersContent + OrdersLoading + OrdersEmpty).
// Navbar/Footer come from the App.vue shell.
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft, ChevronRight, Package } from 'lucide-vue-next';

import OrderCard from '@/components/orders/order-card.vue';
import { Button } from '@/components/ui/button.vue';
import { useCancelOrder, useOrders } from '@/lib/api/hooks/use-orders';

const LIMIT = 10;

const route = useRoute();
const router = useRouter();

const page = computed(() => parseInt((route.query.page as string) || '1', 10) || 1);
const { data, isPending } = useOrders(page, LIMIT);
const cancelOrder = useCancelOrder();

const total = computed(() => data.value?.total ?? 0);
const totalPages = computed(() => Math.ceil(total.value / LIMIT));

// First, last, current ±1, with 'gap' sentinels where pages are skipped.
const visiblePages = computed<(number | 'gap')[]>(() => {
  const pages = Array.from({ length: totalPages.value }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages.value || Math.abs(p - page.value) <= 1,
  );
  const out: (number | 'gap')[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
});

function changePage(newPage: number) {
  const query = { ...route.query };
  if (newPage === 1) delete query.page;
  else query.page = String(newPage);
  router.push({ path: '/orders', query });
}

function handleCancel(orderId: string) {
  if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
  cancelOrder.mutate(orderId);
}

function isCancelling(orderId: string) {
  return !!cancelOrder.isPending.value && cancelOrder.variables.value === orderId;
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-6 pt-10 pb-20">
    <!-- Loading skeleton (OrdersLoading) -->
    <div v-if="isPending" class="flex flex-col gap-8">
      <div class="h-9 w-48 animate-pulse rounded bg-white/10" />
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div v-for="i in 4" :key="i" class="rounded-xl border border-white/10 bg-white/5 p-6">
          <div class="mb-4 flex items-start justify-between">
            <div class="flex-1 space-y-2">
              <div class="h-6 w-32 animate-pulse rounded bg-white/10" />
              <div class="h-4 w-48 animate-pulse rounded bg-white/10" />
            </div>
            <div class="h-6 w-24 animate-pulse rounded bg-white/10" />
          </div>
          <div class="mb-4 space-y-2">
            <div
              v-for="j in 2"
              :key="j"
              class="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
            >
              <div class="flex-1 space-y-1">
                <div class="h-4 w-3/4 animate-pulse rounded bg-white/10" />
                <div class="h-3 w-1/2 animate-pulse rounded bg-white/10" />
              </div>
              <div class="h-4 w-16 animate-pulse rounded bg-white/10" />
            </div>
          </div>
          <div class="flex items-center justify-between border-t border-white/10 pt-4">
            <div class="h-4 w-24 animate-pulse rounded bg-white/10" />
            <div class="h-8 w-20 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state (OrdersEmpty) -->
    <div
      v-else-if="!data || data.orders.length === 0"
      class="flex flex-col items-center justify-center py-20"
    >
      <div class="mb-6 rounded-full bg-white/5 p-6">
        <Package class="h-16 w-16 text-white/20" />
      </div>
      <h2 class="mb-2 text-2xl font-bold text-white">Bạn chưa có đơn hàng nào</h2>
      <p class="mb-8 text-center text-white/60">
        Hãy khám phá các sản phẩm của chúng tôi và tạo đơn hàng đầu tiên
      </p>
      <Button
        class="bg-wds-accent hover:bg-wds-accent/90 font-semibold text-black"
        @click="router.push('/shop')"
      >
        Tiếp tục mua sắm
      </Button>
    </div>

    <div v-else class="flex flex-col gap-8">
      <div>
        <h1 class="mb-2 text-3xl font-bold text-white">Đơn hàng của tôi</h1>
        <p class="text-white/60">Tổng cộng {{ total }} đơn hàng</p>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OrderCard
          v-for="order in data.orders"
          :key="order.id"
          :order="order"
          :is-cancelling="isCancelling(order.id)"
          @cancel="handleCancel"
        />
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
        <Button
          :disabled="page === 1"
          variant="outline"
          size="sm"
          class="border-white/10 text-white hover:bg-white/10"
          @click="changePage(page - 1)"
        >
          <ChevronLeft class="h-4 w-4" />
          Trước
        </Button>

        <div class="flex items-center gap-1">
          <template v-for="(p, idx) in visiblePages" :key="idx">
            <span v-if="p === 'gap'" class="px-2 text-white/60">...</span>
            <Button
              v-else
              :variant="p === page ? 'default' : 'outline'"
              size="sm"
              :class="
                p === page
                  ? 'bg-wds-accent hover:bg-wds-accent/90 text-black'
                  : 'border-white/10 text-white hover:bg-white/10'
              "
              @click="changePage(p)"
            >
              {{ p }}
            </Button>
          </template>
        </div>

        <Button
          :disabled="page === totalPages"
          variant="outline"
          size="sm"
          class="border-white/10 text-white hover:bg-white/10"
          @click="changePage(page + 1)"
        >
          Sau
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

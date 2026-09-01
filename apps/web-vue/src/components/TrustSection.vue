<script setup lang="ts">
// Port of apps/web components/TrustSection.tsx (/shop trust bar).
import { RefreshCw, ShieldCheck, Truck, Zap } from 'lucide-vue-next';

const brands = [
  { icon: ShieldCheck, text: 'Thanh toán an toàn' },
  { icon: Truck, text: 'Giao hàng nhanh chóng' },
  { icon: RefreshCw, text: 'Đổi trả trong 7 ngày' },
  { icon: Zap, text: 'Hỗ trợ 24/7' },
];
</script>

<template>
  <section class="border-y border-white/5 bg-black/20 py-12">
    <div class="mx-auto max-w-7xl px-6">
      <div class="flex flex-wrap items-center justify-center gap-8 md:justify-between md:gap-4">
        <div
          v-for="(item, idx) in brands"
          :key="idx"
          class="group flex cursor-default items-center gap-3"
        >
          <div
            class="group-hover:bg-wds-accent/10 group-hover:text-wds-accent rounded-lg bg-white/5 p-2 text-white/70 transition-all duration-300"
          >
            <component :is="item.icon" class="h-5 w-5" :stroke-width="1.5" />
          </div>
          <span
            class="group-hover:text-wds-accent text-sm font-medium text-white/70 transition-colors"
          >
            {{ item.text }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

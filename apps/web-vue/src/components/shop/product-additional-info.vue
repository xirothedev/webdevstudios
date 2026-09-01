<script setup lang="ts">
import { Motion } from 'motion-v';
import { computed } from 'vue';

import type { ProductInfo } from '@/types/product';

const props = withDefaults(
  defineProps<{
    info: ProductInfo;
    title?: string;
    delay?: number;
  }>(),
  { title: 'Thông tin sản phẩm', delay: 0.3 },
);

const entries = computed(() => Object.entries(props.info).filter(([, value]) => value));
</script>

<template>
  <Motion
    as="section"
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.6, delay }"
    class="mt-20"
  >
    <div class="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
      <h2 class="mb-6 text-2xl font-bold text-white">{{ title }}</h2>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div v-for="[key, value] in entries" :key="key">
          <h3 class="text-wds-accent mb-2 text-sm font-semibold tracking-wider uppercase">
            {{ key }}
          </h3>
          <p class="text-sm text-white/70">{{ value }}</p>
        </div>
      </div>
    </div>
  </Motion>
</template>

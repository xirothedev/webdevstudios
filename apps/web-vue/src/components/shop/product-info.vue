<script setup lang="ts">
import { Star } from 'lucide-vue-next';
import { Motion } from 'motion-v';
import { computed } from 'vue';

import { formatPrice } from '@/lib/utils';

import ProductDescription from './product-description.vue';

const props = withDefaults(
  defineProps<{
    name: string;
    rating: { value: number; count: number };
    price: { current: number; original?: number; discount?: number };
    description: string;
    priceNote?: string;
  }>(),
  {},
);

const discountPercentage = computed(() =>
  props.price.discount
    ? Math.round((props.price.discount / (props.price.original || props.price.current)) * 100)
    : null,
);
</script>

<template>
  <Motion
    as="div"
    :initial="{ opacity: 0, x: 20 }"
    :animate="{ opacity: 1, x: 0 }"
    :transition="{ duration: 0.6, delay: 0.1 }"
    class="flex flex-col justify-center"
  >
    <!-- Product Title -->
    <div class="mb-6">
      <h1 class="mb-3 text-4xl font-bold tracking-tight text-white md:text-5xl">{{ name }}</h1>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1">
          <Star v-for="i in 5" :key="i" class="fill-wds-accent text-wds-accent h-4 w-4" />
        </div>
        <span class="text-sm text-white/60"
          >({{ rating.value }}) · {{ rating.count }} đánh giá</span
        >
      </div>
    </div>

    <!-- Price -->
    <div class="mb-6">
      <div class="flex items-baseline gap-3">
        <span class="text-3xl font-bold text-white">{{ formatPrice(price.current) }}₫</span>
        <span v-if="price.original" class="text-lg text-white/60 line-through">
          {{ formatPrice(price.original) }}₫
        </span>
        <span
          v-if="discountPercentage"
          class="text-wds-accent bg-wds-accent/10 rounded-full px-2 py-1 text-xs font-semibold"
        >
          -{{ discountPercentage }}%
        </span>
      </div>
      <p v-if="priceNote" class="mt-2 text-sm text-white/60">{{ priceNote }}</p>
    </div>

    <!-- Description -->
    <div class="mb-8">
      <ProductDescription :markdown="description" />
    </div>
  </Motion>
</template>

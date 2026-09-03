<script setup lang="ts">
import { Check } from 'lucide-vue-next';
import { Motion } from 'motion-v';

import { cn } from 'cn';

import type { ProductSize } from '@/lib/api/products';

withDefaults(
  defineProps<{
    sizes: ProductSize[];
    selectedSize: ProductSize;
    showSizeGuide?: boolean;
    stockBySize?: Partial<Record<ProductSize, number>>;
  }>(),
  { showSizeGuide: true },
);

defineEmits<{ sizeChange: [size: ProductSize] }>();
</script>

<template>
  <div class="mb-8">
    <label class="mb-3 block text-sm font-semibold text-white/90">Chọn size</label>
    <div class="flex flex-wrap gap-3">
      <button
        v-for="size in sizes"
        :key="size"
        :disabled="stockBySize?.[size] === 0"
        :class="
          cn(
            'relative flex h-12 w-16 cursor-pointer flex-col items-center justify-center rounded-xl border-2 transition-all duration-200',
            stockBySize?.[size] === 0 && 'cursor-not-allowed opacity-50',
            selectedSize === size
              ? 'border-wds-accent bg-wds-accent/10 shadow-wds-accent/20 shadow-lg'
              : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10',
          )
        "
        @click="$emit('sizeChange', size)"
      >
        <span
          :class="
            cn(
              'text-sm font-semibold',
              selectedSize === size ? 'text-wds-accent' : 'text-white/70',
              stockBySize?.[size] === 0 && 'line-through',
            )
          "
        >
          {{ size }}
        </span>
        <Motion
          v-if="selectedSize === size"
          as="div"
          :initial="{ scale: 0 }"
          :animate="{ scale: 1 }"
          class="bg-wds-accent absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full"
        >
          <Check class="h-3 w-3 text-black" />
        </Motion>
        <span
          v-if="stockBySize?.[size] !== undefined && stockBySize[size]! > 0"
          class="mt-0.5 text-[10px] text-white/60"
          >{{ stockBySize[size] }}</span
        >
      </button>
    </div>
    <a
      v-if="showSizeGuide"
      href="#size-guide"
      class="text-wds-accent hover:text-wds-accent/80 mt-2 inline-block text-xs transition-colors"
      >Xem bảng size →</a
    >
  </div>
</template>

<script setup lang="ts">
import { ShoppingCart } from 'lucide-vue-next';
import { Motion } from 'motion-v';

import { Button } from '@/components/ui/button.vue';
import { cn } from '@/lib/cn';

// apps/web gates the Buy Now button on the optional onBuyNow prop; the only caller
// always passes it, so the button renders unconditionally here.
withDefaults(
  defineProps<{
    isAddingToCart?: boolean;
    disabled?: boolean;
    addToCartText?: string;
    buyNowText?: string;
  }>(),
  {
    isAddingToCart: false,
    disabled: false,
    addToCartText: 'Thêm vào giỏ hàng',
    buyNowText: 'Mua ngay',
  },
);

defineEmits<{ addToCart: []; buyNow: [] }>();
</script>

<template>
  <div class="mb-6 flex flex-col gap-3 sm:flex-row">
    <Button
      :disabled="isAddingToCart || disabled"
      :class="
        cn(
          'group bg-wds-accent hover:bg-wds-accent/90 hover:shadow-wds-accent/30 relative h-14 flex-1 overflow-hidden rounded-full font-semibold text-black transition-all hover:shadow-lg',
          (isAddingToCart || disabled) && 'cursor-wait opacity-50',
        )
      "
      @click="$emit('addToCart')"
    >
      <Motion
        v-if="isAddingToCart"
        as="div"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        class="flex items-center gap-2"
      >
        <Motion
          as="div"
          :animate="{ rotate: 360 }"
          :transition="{ duration: 1, repeat: Infinity, ease: 'linear' }"
          class="h-5 w-5 rounded-full border-2 border-black border-t-transparent"
        />
        <span>Đang thêm...</span>
      </Motion>
      <template v-else>
        <ShoppingCart class="mr-2 h-5 w-5" />
        {{ addToCartText }}
      </template>
    </Button>
    <Button
      variant="outline"
      :disabled="disabled"
      :class="
        cn(
          'border-wds-accent/30 text-wds-accent hover:bg-wds-accent/10 h-14 rounded-full border px-6 font-semibold',
          disabled && 'cursor-not-allowed opacity-50',
        )
      "
      @click="$emit('buyNow')"
    >
      {{ buyNowText }}
    </Button>
  </div>
</template>

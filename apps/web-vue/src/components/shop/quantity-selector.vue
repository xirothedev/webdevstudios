<script setup lang="ts">
import { cva } from 'class-variance-authority';
import { Minus, Plus } from 'lucide-vue-next';
import { computed } from 'vue';

import NumberTicker from '@/components/ui/number-ticker.vue';
import { cn } from 'cn';

const quantitySelectorVariants = cva('flex items-center gap-2 rounded-lg border border-white/10', {
  variants: {
    variant: {
      default: 'bg-white/5 px-4 py-3',
      compact: 'px-1',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

const quantityButtonVariants = cva(
  'cursor-pointer text-white/70 transition-colors disabled:cursor-not-allowed disabled:opacity-30 hover:text-wds-accent',
  {
    variants: {
      variant: {
        default: '',
        compact: 'h-auto px-3 py-1 hover:bg-transparent',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

const props = withDefaults(
  defineProps<{
    quantity: number;
    max?: number;
    stock?: number;
    disabled?: boolean;
    showIcons?: boolean;
    variant?: 'default' | 'compact';
    size?: 'sm' | 'md' | 'lg';
  }>(),
  { max: 10, disabled: false, showIcons: true, variant: 'default', size: 'md' },
);

defineEmits<{ increase: []; decrease: [] }>();

const maxQuantity = computed(() => (props.stock !== undefined ? props.stock : props.max));
const isDecreaseDisabled = computed(() => props.disabled || props.quantity <= 1);
const isIncreaseDisabled = computed(() => props.disabled || props.quantity >= maxQuantity.value);
</script>

<template>
  <div class="flex items-center gap-4">
    <div :class="cn(quantitySelectorVariants({ variant, size }))">
      <button
        :disabled="isDecreaseDisabled"
        :class="cn(quantityButtonVariants({ variant, size }))"
        type="button"
        aria-label="Giảm số lượng"
        @click="$emit('decrease')"
      >
        <Minus v-if="showIcons" class="h-4 w-4" />
        <span v-else class="text-base">-</span>
      </button>
      <span
        :class="
          cn('min-w-8 text-center font-semibold text-white', variant === 'compact' && 'px-4 py-1')
        "
      >
        {{ quantity }}
      </span>
      <button
        :disabled="isIncreaseDisabled"
        :class="cn(quantityButtonVariants({ variant, size }))"
        type="button"
        aria-label="Tăng số lượng"
        @click="$emit('increase')"
      >
        <Plus v-if="showIcons" class="h-4 w-4" />
        <span v-else class="text-base">+</span>
      </button>
    </div>
    <span v-if="stock !== undefined && variant === 'default'" class="text-sm text-white/60">
      Còn lại:
      <span class="font-semibold text-white">
        <NumberTicker :value="stock" :start-value="stock" class="text-white" />
      </span>
      sản phẩm
      <span v-if="quantity >= stock" class="text-wds-accent ml-2">(Đã đạt tối đa)</span>
    </span>
  </div>
</template>

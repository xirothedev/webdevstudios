<script setup lang="ts">
import QuantitySelector from './quantity-selector.vue';

defineProps<{
  quantity: number;
  max?: number;
  stock?: number;
}>();

defineEmits<{ increase: []; decrease: [] }>();
</script>

<template>
  <div class="mb-8">
    <label class="mb-3 block text-sm font-semibold text-white/90">Số lượng</label>
    <QuantitySelector
      :quantity="quantity"
      :max="max"
      :stock="stock"
      variant="default"
      @increase="$emit('increase')"
      @decrease="$emit('decrease')"
    />
  </div>
</template>

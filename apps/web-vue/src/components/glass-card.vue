<script setup lang="ts">
// Port of the local GlassCard in apps/web components/FeaturesGrid.tsx.
// ponytail: framer useSpring/useTransform smoothing dropped — motion-v has no useSpring;
// direct rotation + CSS transition reads the same. Add a spring if it ever feels stiff.
import { ref } from 'vue';

withDefaults(defineProps<{ colSpan?: string; className?: string }>(), {
  colSpan: 'col-span-1',
  className: '',
});

const rotateX = ref(0);
const rotateY = ref(0);

function onMouseMove(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const xPct = (e.clientX - rect.left) / rect.width - 0.5;
  const yPct = (e.clientY - rect.top) / rect.height - 0.5;
  rotateX.value = yPct * -16; // [-0.5, 0.5] -> [8, -8]
  rotateY.value = xPct * 16; // [-0.5, 0.5] -> [-8, 8]
}

function onMouseLeave() {
  rotateX.value = 0;
  rotateY.value = 0;
}
</script>

<template>
  <div :class="`${colSpan} ${className}`" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
    <div
      class="relative h-full transition-transform duration-150 ease-out"
      :style="{
        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: 'preserve-3d',
      }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { AnimatePresence, Motion } from 'motion-v';
import { ref } from 'vue';

import { cn } from '@/lib/cn';

const props = defineProps<{
  images: Array<{ src: string; alt: string }>;
  badge?: string;
}>();

const selectedImageIndex = ref(0);
const selected = () => props.images[selectedImageIndex.value] ?? props.images[0];
</script>

<template>
  <Motion
    as="div"
    :initial="{ opacity: 0, x: -20 }"
    :animate="{ opacity: 1, x: 0 }"
    :transition="{ duration: 0.6 }"
    class="relative"
  >
    <div
      class="group relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
    >
      <!-- Glow effect -->
      <div
        class="from-wds-accent/40 via-wds-accent/15 absolute inset-0 bg-linear-to-t to-transparent opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
      />

      <!-- Image -->
      <div class="relative h-full w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <Motion
            :key="selectedImageIndex"
            as="div"
            :initial="{ opacity: 0, scale: 0.95 }"
            :animate="{ opacity: 1, scale: 1 }"
            :exit="{ opacity: 0, scale: 0.95 }"
            :transition="{ duration: 0.3, ease: 'easeInOut' }"
            :while-hover="{ scale: 1.05 }"
            class="relative h-full w-full"
          >
            <img
              :src="selected()?.src"
              :alt="selected()?.alt"
              class="absolute inset-0 h-full w-full object-contain p-8 drop-shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
            />
          </Motion>
        </AnimatePresence>
      </div>

      <!-- Badge -->
      <div
        v-if="badge"
        class="border-wds-accent/30 bg-wds-accent/10 absolute top-4 left-4 rounded-full border px-3 py-1.5 backdrop-blur-sm"
      >
        <span class="text-wds-accent text-xs font-semibold tracking-wider uppercase">
          {{ badge }}
        </span>
      </div>
    </div>

    <!-- Thumbnail gallery -->
    <div v-if="images.length > 1" class="mt-4 flex gap-3">
      <button
        v-for="(image, index) in images"
        :key="index"
        :class="
          cn(
            'relative h-20 w-20 cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200',
            selectedImageIndex === index
              ? 'border-wds-accent shadow-wds-accent/20 shadow-lg'
              : 'border-white/10 hover:border-white/20',
          )
        "
        @click="selectedImageIndex = index"
      >
        <img
          :src="image.src"
          :alt="image.alt"
          class="absolute inset-0 h-full w-full object-contain p-2"
          loading="lazy"
        />
      </button>
    </div>
  </Motion>
</template>

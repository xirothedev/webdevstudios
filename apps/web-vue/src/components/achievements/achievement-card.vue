<script setup lang="ts">
// Port of apps/web src/components/achievements/AchievementCard.tsx.
import { motion } from 'motion-v';

import type { AwardItem } from '@/data/achievements';

defineProps<{ item: AwardItem; index: number }>();
</script>

<template>
  <motion.div
    :initial="{ opacity: 0, y: 20 }"
    :while-in-view="{ opacity: 1, y: 0 }"
    :viewport="{ once: true }"
    :transition="{ delay: index * 0.1 }"
    class="group hover:border-wds-accent/50 hover:bg-wds-accent/5 relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/3 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
  >
    <!-- Decorative Gradient Blob -->
    <div
      class="bg-wds-accent/10 group-hover:bg-wds-accent/20 absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl transition-all"
    />

    <div class="flex items-start justify-between">
      <div
        class="group-hover:text-wds-accent group-hover:ring-wds-accent/30 rounded-xl bg-white/5 p-3 text-white ring-1 ring-white/10 transition-colors"
      >
        <component :is="item.icon" :size="32" :class="item.iconClass" />
      </div>
      <span
        class="border-wds-accent/20 bg-wds-accent/10 text-wds-accent rounded-full border px-3 py-1 text-xs font-semibold"
      >
        {{ item.rank }}
      </span>
    </div>

    <div class="relative z-10">
      <h3
        class="group-hover:text-wds-accent text-xl font-bold text-white transition-colors duration-200"
      >
        {{ item.title }}
      </h3>
      <p class="mt-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
        {{ item.organizer }}
      </p>
      <p class="mt-3 text-sm leading-relaxed text-gray-400 group-hover:text-gray-300">
        {{ item.description }}
      </p>
    </div>
  </motion.div>
</template>

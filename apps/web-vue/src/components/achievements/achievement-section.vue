<script setup lang="ts">
// Port of apps/web src/components/achievements/AchievementSection.tsx.
import { Sparkles } from 'lucide-vue-next';
import { motion } from 'motion-v';

defineProps<{ label?: string; title?: string; subtitle?: string }>();
</script>

<template>
  <div class="mb-16 flex flex-col gap-3 text-center">
    <motion.span
      v-if="label"
      :initial="{ opacity: 0, y: 10 }"
      :while-in-view="{ opacity: 1, y: 0 }"
      :viewport="{ once: true }"
      class="text-wds-accent flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase"
    >
      <Sparkles :size="12" /> {{ label }} <Sparkles :size="12" />
    </motion.span>

    <motion.h2
      v-if="title"
      :initial="{ opacity: 0, y: 10 }"
      :while-in-view="{ opacity: 1, y: 0 }"
      :viewport="{ once: true }"
      :transition="{ delay: 0.1 }"
      class="text-3xl font-bold text-balance text-white sm:text-5xl"
    >
      {{ title }}
    </motion.h2>

    <motion.p
      v-if="subtitle"
      :initial="{ opacity: 0, y: 10 }"
      :while-in-view="{ opacity: 1, y: 0 }"
      :viewport="{ once: true }"
      :transition="{ delay: 0.2 }"
      class="mx-auto mt-2 max-w-2xl text-pretty text-gray-400"
    >
      {{ subtitle }}
    </motion.p>
  </div>
</template>

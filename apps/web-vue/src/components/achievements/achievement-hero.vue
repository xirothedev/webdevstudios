<script setup lang="ts">
// Port of apps/web src/components/achievements/AchievementHero.tsx.
import { Award } from 'lucide-vue-next';
import { motion } from 'motion-v';

import { STATS } from '@/data/achievements';
</script>

<template>
  <section class="mb-24 px-6">
    <div class="mx-auto max-w-4xl text-center">
      <motion.div
        :initial="{ opacity: 0, scale: 0.9 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{ duration: 0.5 }"
        class="border-wds-accent/30 bg-wds-accent/10 text-wds-accent mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold backdrop-blur-md"
      >
        <Award :size="14" />
        <span>Bảng vàng thành tích</span>
      </motion.div>

      <motion.h1
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.1, duration: 0.6 }"
        class="mb-8 text-5xl font-extrabold tracking-tight text-white sm:text-7xl"
      >
        Hall of{' '}
        <span class="text-wds-accent relative inline-block">
          Fame
          <svg
            class="text-wds-accent absolute -bottom-1 left-0 h-3 w-full opacity-50"
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
          >
            <path d="M0 5 Q 50 10 100 5" stroke="currentColor" stroke-width="4" fill="none" />
          </svg>
        </span>
      </motion.h1>

      <motion.p
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.2, duration: 0.6 }"
        class="mx-auto mb-12 max-w-2xl text-lg text-pretty text-gray-400"
      >
        Những cột mốc đáng nhớ và giải thưởng danh giá đánh dấu sự nỗ lực không ngừng nghỉ của các
        thế hệ thành viên WebDev Studios.
      </motion.p>

      <!-- Stats Counter -->
      <motion.div
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.3 }"
        class="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <div
          v-for="stat in STATS"
          :key="stat.id"
          class="hover:border-wds-accent/30 flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/3 p-6 backdrop-blur-sm transition-colors"
        >
          <div class="text-wds-accent mb-1">
            <component :is="stat.icon" :size="20" />
          </div>
          <div class="text-3xl font-bold text-white">{{ stat.value }}</div>
          <div class="text-xs font-medium tracking-wide text-gray-500 uppercase">
            {{ stat.label }}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { BriefcaseBusiness, Layers3, Timer, Users } from 'lucide-vue-next';
import { motion } from 'motion-v';

import { NumberTicker } from '@/components/ui/number-ticker.vue';

// Port of apps/web src/components/wds/StatsSection.tsx (WDSStatsSection).
const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stats = [
  { icon: Layers3, label: 'Hơn 10 dự án lớn', value: 10, suffix: '+', delay: 0.1 },
  { icon: Timer, label: 'Hơn 2 năm kinh nghiệm', value: 2, suffix: '+', delay: 0.2 },
  { icon: Users, label: 'Hơn 45 thành viên', value: 45, suffix: '+', delay: 0.3 },
  { icon: BriefcaseBusiness, label: '4 vị trí để ứng tuyển', value: 4, suffix: '', delay: 0.4 },
];
</script>

<template>
  <section class="bg-white py-20 sm:py-24 md:py-28">
    <div class="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
      <motion.div
        initial="initial"
        while-in-view="animate"
        :viewport="{ once: true, margin: '-80px' }"
        :transition="{ staggerChildren: 0.1 }"
      >
        <motion.h2
          :variants="fadeInUp"
          :transition="{ duration: 0.6, ease: [0.34, 0.7, 0.25, 1] }"
          class="text-3xl font-bold tracking-tight text-black sm:text-4xl md:text-5xl"
        >
          Đôi điều về chúng tôi
        </motion.h2>
        <motion.p
          :variants="fadeInUp"
          :transition="{ duration: 0.6, delay: 0.05, ease: [0.34, 0.7, 0.25, 1] }"
          class="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-gray-700 sm:text-lg"
        >
          Được thành lập năm 2018 với hơn 20 thành viên, WebDev Studios đã phát triển thành một
          trong những câu lạc bộ phát triển mạnh mẽ tại trường Đại học Công nghệ Thông tin – ĐHQG
          TP.HCM.
        </motion.p>
      </motion.div>

      <motion.div
        class="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4"
        initial="initial"
        while-in-view="animate"
        :viewport="{ once: true, margin: '-80px' }"
        :transition="{ staggerChildren: 0.1 }"
      >
        <motion.div
          v-for="stat in stats"
          :key="stat.label"
          :variants="fadeInUp"
          :transition="{ duration: 0.6, delay: stat.delay, ease: [0.34, 0.7, 0.25, 1] }"
          class="flex flex-col items-center gap-4"
        >
          <div
            class="bg-wds-accent flex h-32 w-32 items-center justify-center rounded-full shadow-[0_18px_40px_rgba(0,0,0,0.08)] sm:h-36 sm:w-36"
          >
            <div class="flex flex-col items-center justify-center gap-1">
              <component :is="stat.icon" class="h-8 w-8 text-black" />
              <div class="flex items-baseline gap-1 text-3xl font-semibold text-black sm:text-4xl">
                <NumberTicker :value="stat.value" class="text-3xl sm:text-4xl" />
                <span v-if="stat.suffix">{{ stat.suffix }}</span>
              </div>
            </div>
          </div>
          <p class="max-w-xs text-sm font-medium text-gray-800 sm:text-base">{{ stat.label }}</p>
        </motion.div>
      </motion.div>
    </div>
  </section>
</template>

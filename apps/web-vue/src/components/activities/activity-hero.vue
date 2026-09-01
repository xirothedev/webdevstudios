<script setup lang="ts">
// Port of apps/web src/components/activities/ActivityHero.tsx.
import { Zap } from 'lucide-vue-next';
import { motion } from 'motion-v';
</script>

<template>
  <section class="mb-16 px-6">
    <div class="mx-auto max-w-7xl">
      <div class="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div class="max-w-2xl">
          <motion.div
            :initial="{ opacity: 0, x: -20 }"
            :animate="{ opacity: 1, x: 0 }"
            class="text-wds-accent mb-4 inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase"
          >
            <Zap :size="14" /> Hoạt động sôi nổi
          </motion.div>

          <motion.h1
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.1 }"
            class="text-4xl font-extrabold tracking-tight text-balance text-white sm:text-6xl"
          >
            Nơi đam mê <br />
            <span
              class="from-wds-accent to-wds-secondary bg-linear-to-r bg-clip-text text-transparent"
            >
              chuyển hóa thành hành động
            </span>
          </motion.h1>
        </div>

        <motion.p
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.2 }"
          class="max-w-sm text-sm text-pretty text-gray-400 sm:text-base md:text-right"
        >
          Hơn 50+ sự kiện mỗi năm. Từ workshop chuyên sâu, hackathon kịch tính đến những chuyến đi
          gắn kết không thể nào quên.
        </motion.p>
      </div>
    </div>
  </section>
</template>

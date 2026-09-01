<script setup lang="ts">
import { motion } from 'motion-v';

// Port of apps/web src/components/wds/MissionSection.tsx (WDSMissionSection).
const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
};

const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] },
};
</script>

<template>
  <section class="relative overflow-hidden bg-linear-to-b from-gray-50 to-white py-16 md:py-24">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <!-- Image - First on mobile, second on desktop -->
        <motion.div
          class="relative order-2 h-[400px] w-full sm:h-[500px] lg:order-1"
          initial="initial"
          while-in-view="animate"
          :viewport="{ once: true, margin: '-100px' }"
          :variants="fadeInLeft"
        >
          <div class="relative h-full w-full overflow-hidden rounded-2xl shadow-lg">
            <img
              src="/image/ton-chi.webp"
              alt="Tôn chỉ của WebDev Studios - Tuân thủ quy định, học hỏi và phát triển"
              class="absolute inset-0 size-full object-contain object-center"
            />
            <!-- Gradient overlay -->
            <div
              class="from-wds-accent/10 absolute inset-0 bg-linear-to-br via-transparent to-transparent"
            ></div>
          </div>
          <!-- Decorative element -->
          <div
            class="bg-wds-accent/10 absolute -right-4 -bottom-4 -z-10 h-32 w-32 rounded-full blur-2xl"
          ></div>
        </motion.div>

        <!-- Content -->
        <motion.div
          class="order-1 space-y-6 md:space-y-8 lg:order-2"
          initial="initial"
          while-in-view="animate"
          :viewport="{ once: true, margin: '-100px' }"
          :variants="fadeInRight"
        >
          <div>
            <h2 class="text-3xl leading-tight font-bold text-black sm:text-4xl md:text-5xl">
              Tôn chỉ
            </h2>
            <div class="from-wds-accent to-wds-accent/50 mt-4 h-1 w-20 bg-linear-to-r"></div>
          </div>

          <div class="space-y-4">
            <p class="text-base leading-relaxed text-gray-700 sm:text-lg md:text-xl">
              Các thành viên tuân thủ quy định của Hội sinh viên và Câu lạc bộ. Tiếp thu, học hỏi
              kiến thức, nắm bắt xu hướng và công nghệ mới. Tôn trọng, chia sẻ và có trách nhiệm.
            </p>
          </div>

          <RouterLink
            to="/mission"
            class="group border-wds-accent text-wds-accent hover:bg-wds-accent focus:ring-wds-accent relative inline-flex items-center gap-2 overflow-hidden rounded-lg border-2 bg-transparent px-8 py-4 text-base font-semibold transition-all duration-300 hover:text-black focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <span class="relative z-10">Đọc thêm</span>
            <motion.span
              class="relative z-10"
              :initial="{ x: 0 }"
              :while-hover="{ x: 4 }"
              :transition="{ duration: 0.2 }"
            >
              →
            </motion.span>
          </RouterLink>
        </motion.div>
      </div>
    </div>
  </section>
</template>

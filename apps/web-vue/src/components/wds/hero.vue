<script setup lang="ts">
import { motion } from 'motion-v';

// Port of apps/web src/components/wds/Hero.tsx (WDSHero).
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.8, delay: 0.3, ease: [0.6, -0.05, 0.01, 0.99] },
};
</script>

<template>
  <section class="relative overflow-hidden bg-white py-10 sm:py-30 md:py-24 lg:py-1">
    <!-- Background decoration -->
    <div class="absolute inset-0 -z-10">
      <div
        class="bg-wds-secondary absolute top-1/4 right-0 h-96 w-96 rounded-full opacity-30 blur-[120px]"
      ></div>
      <div
        class="bg-wds-accent/10 absolute bottom-1/4 left-0 h-80 w-80 rounded-full opacity-20 blur-[100px]"
      ></div>
    </div>

    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <!-- Content -->
        <motion.div
          class="space-y-6 md:space-y-8"
          initial="initial"
          animate="animate"
          :variants="fadeInUp"
        >
          <motion.div :variants="fadeInUp">
            <h1
              class="text-4xl leading-tight font-bold text-black sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Chúng tôi là <br />
              <span
                class="from-wds-accent to-wds-accent/80 bg-linear-to-r bg-clip-text text-transparent"
              >
                WebDev Studios
              </span>
            </h1>
          </motion.div>

          <motion.p
            class="text-base leading-relaxed text-gray-700 sm:text-lg md:text-xl"
            :variants="fadeInUp"
          >
            WebDev Studios là nơi tập hợp các bạn sinh viên có niềm đam mê với Lập trình Web nhằm
            tạo ra một môi trường học tập và giải trí để các bạn có thể học hỏi, trau dồi kỹ năng và
            phát triển bản thân.
          </motion.p>

          <motion.div :variants="fadeInUp">
            <RouterLink
              to="/about"
              class="group bg-wds-accent hover:bg-wds-accent/90 hover:shadow-wds-accent/30 focus:ring-wds-accent relative inline-flex items-center gap-2 overflow-hidden rounded-lg px-8 py-4 text-base font-semibold text-black transition-all duration-300 hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:outline-none"
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
              <motion.div
                class="from-wds-accent to-wds-accent/80 absolute inset-0 bg-linear-to-r"
                :initial="{ x: '-100%' }"
                :while-hover="{ x: 0 }"
                :transition="{ duration: 0.3 }"
              />
            </RouterLink>
          </motion.div>
        </motion.div>

        <!-- Image -->
        <motion.div
          class="relative h-[400px] w-full sm:h-[500px] lg:h-[600px]"
          initial="initial"
          animate="animate"
          :variants="scaleIn"
        >
          <div class="relative h-full w-full overflow-hidden rounded-2xl">
            <img
              src="/image/hero-image.webp"
              alt="WebDev Studios - Câu lạc bộ lập trình web của sinh viên UIT"
              class="absolute inset-0 size-full object-contain object-center"
            />
          </div>

          <!-- Decorative elements -->
          <motion.div
            class="bg-wds-secondary absolute -top-4 -right-4 -z-10 h-64 w-64 rounded-full opacity-40 blur-3xl"
            :animate="{ scale: [1, 1.1, 1], opacity: [0.4, 0.5, 0.4] }"
            :transition="{ duration: 4, repeat: Infinity, ease: 'easeInOut' }"
          />
          <motion.div
            class="bg-wds-accent/20 absolute -bottom-4 -left-4 -z-10 h-48 w-48 rounded-full opacity-30 blur-2xl"
            :animate="{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }"
            :transition="{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }"
          />
        </motion.div>
      </div>
    </div>
  </section>
</template>

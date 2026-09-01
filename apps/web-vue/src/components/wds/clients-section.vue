<script setup lang="ts">
import { motion } from 'motion-v';

// Port of apps/web src/components/wds/ClientsSection.tsx (WDSClientsSection).
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
  <section class="relative overflow-hidden bg-white py-16 md:py-24">
    <!-- Background decoration -->
    <div class="absolute inset-0 -z-10">
      <div
        class="bg-wds-secondary absolute top-1/2 right-0 h-64 w-64 rounded-full opacity-20 blur-[100px]"
      ></div>
    </div>

    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <!-- Content -->
        <motion.div
          class="order-1 space-y-6 md:space-y-8 lg:order-1"
          initial="initial"
          while-in-view="animate"
          :viewport="{ once: true, margin: '-100px' }"
          :variants="fadeInLeft"
        >
          <div>
            <h2 class="text-3xl leading-tight font-bold text-black sm:text-4xl md:text-5xl">
              Các đối tác khách hàng
            </h2>
            <div class="from-wds-accent to-wds-accent/50 mt-4 h-1 w-20 bg-linear-to-r"></div>
          </div>

          <p class="text-base leading-relaxed text-gray-700 sm:text-lg md:text-xl">
            WebDev Studios từng vinh dự được hợp tác và nhận sự tin tưởng từ các đối tác uy tín.
            Chúng tôi tự hào về những dự án đã hoàn thành và mối quan hệ hợp tác bền chặt với khách
            hàng.
          </p>

          <RouterLink
            to="/clients"
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
          </RouterLink>
        </motion.div>

        <!-- Image -->
        <motion.div
          class="relative order-2 h-[400px] w-full sm:h-[500px] lg:order-2"
          initial="initial"
          while-in-view="animate"
          :viewport="{ once: true, margin: '-100px' }"
          :variants="fadeInRight"
        >
          <div class="relative h-full w-full overflow-hidden rounded-2xl shadow-lg">
            <img
              src="/image/khach-hang.webp"
              alt="Đối tác và khách hàng của WebDev Studios"
              class="absolute inset-0 size-full object-contain object-center"
            />
            <!-- Gradient overlay -->
            <div
              class="absolute inset-0 bg-linear-to-tl from-black/20 via-transparent to-transparent"
            ></div>
          </div>
          <!-- Decorative element -->
          <div
            class="bg-wds-accent/10 absolute -top-4 -left-4 -z-10 h-32 w-32 rounded-full blur-2xl"
          ></div>
        </motion.div>
      </div>
    </div>
  </section>
</template>

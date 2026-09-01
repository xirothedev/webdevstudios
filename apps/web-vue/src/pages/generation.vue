<script setup lang="ts">
// Port of apps/web src/app/generation. Navbar/Footer are rendered by the shell (App.vue).
import { Star, Users } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';

import DesktopBentoGrid from '@/components/generation/desktop-bento-grid.vue';
import ExpandableGenerationSection from '@/components/generation/expandable-generation-section.vue';
import { generations } from '@/data/generations';
import { usePageMeta } from '@/lib/metadata';

usePageMeta({
  title: 'Các thế hệ lãnh đạo',
  description:
    'Khám phá hành trình của WebDev Studios qua các thế hệ lãnh đạo tận tụy đã kiến tạo cộng đồng của chúng tôi.',
  path: '/generation',
  keywords: [
    'Thế hệ lãnh đạo WebDev Studios',
    'Lịch sử WebDev Studios',
    'Các thế hệ WebDev',
    'Ban chủ nhiệm WebDev',
  ],
});

const starPositions = ref<
  Array<{
    left: number;
    top: number;
    delay: number;
    duration: number;
  }>
>([]);

onMounted(() => {
  starPositions.value = Array.from({ length: 6 }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 4 + Math.random() * 4,
  }));
});
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Hero Section with animated background -->
    <section class="relative overflow-hidden py-16 sm:py-20 lg:py-32">
      <!-- Animated gradient background -->
      <div
        class="via-wds-secondary/10 to-wds-secondary/20 absolute inset-0 bg-linear-to-b from-white"
      />

      <!-- Floating stars animation -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          v-for="(star, i) in starPositions"
          :key="i"
          class="animate-float absolute"
          :style="{
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }"
        >
          <Star :class="`h-4 w-4 ${i % 2 === 0 ? 'text-wds-accent/30' : 'text-wds-accent/20'}`" />
        </div>
      </div>

      <!-- Retro grid pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="retro-grid" />
      </div>

      <div class="relative mx-auto max-w-6xl px-4 sm:px-6">
        <!-- Section header -->
        <div class="mb-12 flex flex-col gap-4 text-center sm:mb-16 sm:gap-6">
          <div class="inline-flex items-center justify-center gap-2">
            <Users class="text-wds-accent h-5 w-5" />
            <span class="text-wds-accent text-sm font-bold tracking-widest uppercase">
              Di sản của chúng tôi
            </span>
          </div>
          <h1
            class="text-3xl leading-tight font-black text-balance sm:text-4xl lg:text-5xl xl:text-6xl"
          >
            Các thế hệ{' '}
            <span class="text-wds-accent relative inline-block">
              Lãnh đạo
              <svg
                class="absolute -bottom-2 left-0 w-full"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 228 62"
                fill="none"
                preserveAspectRatio="none"
                :style="{ height: '16px' }"
              >
                <path
                  d="M2.16113 4.12184C32.9272 3.15566 210.477 0.901249 224.787 4.12184C242.674 8.14757 50.4565 15.877 40.7974 18.7755C33.0701 21.0943 191.766 26.3439 201.067 26.988C210.369 27.6321 90.5241 37.8414 91.9551 59.999"
                  stroke="#F7931E"
                  stroke-width="6"
                  stroke-linecap="round"
                />
              </svg>
            </span>
          </h1>
          <p class="mx-auto max-w-2xl px-4 text-sm text-pretty text-gray-600 sm:text-base">
            Khám phá hành trình của WebDev Studios qua các thế hệ lãnh đạo tận tụy đã kiến tạo cộng
            đồng của chúng tôi.
          </p>
        </div>
      </div>
    </section>

    <!-- Generation Sections -->
    <section class="relative">
      <div class="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <!-- Mobile/Tablet: Expandable sections -->
        <div class="flex flex-col gap-6 lg:hidden">
          <ExpandableGenerationSection
            v-for="gen in generations"
            :key="gen.gen"
            :generation="gen"
          />
        </div>

        <!-- Desktop: Bento grid layout -->
        <div class="hidden flex-col gap-8 lg:flex">
          <DesktopBentoGrid v-for="gen in generations" :key="gen.gen" :generation="gen" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Custom animations (styled-jsx in the React original) */
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>

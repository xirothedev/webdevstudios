<script setup lang="ts">
// Port of apps/web app/not-found.tsx. Navbar/Footer come from the App.vue shell.
import { ArrowLeft, Home, Search } from 'lucide-vue-next';
import { Motion } from 'motion-v';
import { onMounted, onUnmounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

const mousePosition = ref({ x: 0, y: 0 });
const floatingElements = ref<
  Array<{
    initialX: number;
    initialY: number;
    animateX: number;
    animateY: number;
    duration: number;
  }>
>([]);

function handleMouseMove(e: MouseEvent) {
  mousePosition.value = {
    x: (e.clientX / window.innerWidth) * 100,
    y: (e.clientY / window.innerHeight) * 100,
  };
}

const suggestions = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Về chúng tôi', to: '/about' },
  { label: 'Shop', to: '/shop' },
  { label: 'Thế hệ', to: '/generation' },
  { label: 'FAQ', to: '/faq' },
];

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove);
  floatingElements.value = Array.from({ length: 6 }, () => ({
    initialX: Math.random() * 400 - 200,
    initialY: Math.random() * 400 - 200,
    animateX: Math.random() * 400 - 200,
    animateY: Math.random() * 400 - 200,
    duration: 3 + Math.random() * 2,
  }));
});
onUnmounted(() => window.removeEventListener('mousemove', handleMouseMove));

const goBack = () => window.history.back();
</script>

<template>
  <div
    class="bg-wds-background text-wds-text selection:bg-wds-accent/30 selection:text-wds-text relative min-h-screen overflow-hidden"
  >
    <!-- Background ambient glow with mouse tracking -->
    <div class="fixed inset-0 -z-10 overflow-hidden">
      <Motion
        class="bg-wds-accent/20 absolute top-[20%] left-[20%] h-[60%] w-[60%] rounded-full blur-[120px]"
        :animate="{ x: `${mousePosition.x * 0.5}%`, y: `${mousePosition.y * 0.5}%` }"
        :transition="{ type: 'spring', stiffness: 50, damping: 20 }"
      />
      <Motion
        class="absolute right-[10%] bottom-[10%] h-[50%] w-[50%] rounded-full bg-purple-500/20 blur-[120px]"
        :animate="{ x: `${mousePosition.x * -0.3}%`, y: `${mousePosition.y * -0.3}%` }"
        :transition="{ type: 'spring', stiffness: 50, damping: 20 }"
      />
    </div>

    <!-- Retro Grid Pattern -->
    <div class="retro-grid pointer-events-none fixed inset-0 z-0 opacity-40" />

    <main
      class="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 pt-24 pb-20"
    >
      <div class="mx-auto max-w-4xl text-center">
        <!-- Animated 404 Number -->
        <Motion
          class="mb-8"
          :initial="{ opacity: 0, scale: 0.5 }"
          :animate="{ opacity: 1, scale: 1 }"
          :transition="{ duration: 0.8, type: 'spring', bounce: 0.4 }"
        >
          <Motion
            class="relative inline-block"
            :animate="{ rotate: [0, -5, 5, -5, 0] }"
            :transition="{ duration: 4, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }"
          >
            <span
              class="from-wds-accent via-wds-accent to-wds-accent/60 bg-linear-to-b bg-clip-text text-9xl font-bold tracking-tight text-transparent drop-shadow-[0_0_40px_rgba(247,147,30,0.5)] md:text-[12rem]"
            >
              404
            </span>
            <!-- Glow effect behind 404 -->
            <Motion
              class="bg-wds-accent/30 absolute inset-0 -z-10 blur-3xl"
              :animate="{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }"
              :transition="{ duration: 3, repeat: Infinity, ease: 'easeInOut' }"
            />
          </Motion>
        </Motion>

        <!-- Error Message -->
        <Motion
          class="mb-12"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.6, delay: 0.2 }"
        >
          <h2 class="mb-4 text-3xl font-bold text-white md:text-4xl">Trang không tồn tại</h2>
          <p class="mx-auto max-w-lg text-lg text-white/70">
            Có vẻ như trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. Hãy quay lại trang
            chủ hoặc khám phá các sản phẩm của chúng tôi.
          </p>
        </Motion>

        <!-- Animated Floating Elements -->
        <div class="relative mb-12">
          <Motion
            v-for="(element, i) in floatingElements"
            :key="i"
            class="absolute"
            :initial="{ opacity: 0, scale: 0, x: element.initialX, y: element.initialY }"
            :animate="{
              opacity: [0, 0.3, 0],
              scale: [0, 1, 0],
              x: element.animateX,
              y: element.animateY,
            }"
            :transition="{
              duration: element.duration,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut',
            }"
          >
            <div class="bg-wds-accent/40 h-2 w-2 rounded-full blur-sm" />
          </Motion>
        </div>

        <!-- Action Buttons -->
        <Motion
          class="flex flex-col items-center justify-center gap-4 sm:flex-row"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.6, delay: 0.4 }"
        >
          <RouterLink
            to="/"
            class="group bg-wds-accent hover:bg-wds-accent/90 hover:shadow-wds-accent/30 relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-base font-semibold text-black transition-all hover:shadow-lg"
          >
            <Motion
              class="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
              :animate="{ x: ['-100%', '200%'] }"
              :transition="{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: 'linear' }"
            />
            <Home class="relative z-10 h-5 w-5" />
            <span class="relative z-10">Về trang chủ</span>
          </RouterLink>

          <RouterLink
            to="/shop"
            class="group border-wds-accent/30 text-wds-accent hover:border-wds-accent hover:bg-wds-accent/10 relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border-2 bg-transparent px-6 py-3 text-base font-semibold transition-all"
          >
            <Search class="h-5 w-5" />
            <span>Khám phá Shop</span>
          </RouterLink>

          <button
            class="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-base font-semibold text-white/70 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
            @click="goBack"
          >
            <ArrowLeft class="h-5 w-5" />
            <span>Quay lại</span>
          </button>
        </Motion>

        <!-- Decorative Elements -->
        <Motion
          class="mt-16"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :transition="{ duration: 1, delay: 0.6 }"
        >
          <div
            class="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
          >
            <h3 class="text-wds-accent mb-4 text-sm font-semibold tracking-wider uppercase">
              Gợi ý cho bạn
            </h3>
            <ul class="space-y-2 text-left text-sm text-white/70">
              <Motion
                v-for="(item, index) in suggestions"
                :key="item.to"
                :initial="{ opacity: 0, x: -20 }"
                :animate="{ opacity: 1, x: 0 }"
                :transition="{ delay: 0.8 + index * 0.1 }"
              >
                <RouterLink
                  :to="item.to"
                  class="hover:text-wds-accent flex items-center gap-2 transition-colors"
                >
                  <span class="bg-wds-accent h-1.5 w-1.5 rounded-full" />
                  {{ item.label }}
                </RouterLink>
              </Motion>
            </ul>
          </div>
        </Motion>
      </div>
    </main>
  </div>
</template>

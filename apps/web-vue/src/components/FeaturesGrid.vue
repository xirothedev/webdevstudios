<script setup lang="ts">
// Port of apps/web components/FeaturesGrid.tsx (/shop product showcase grid).
import { Circle, ShoppingBag, Shirt, Star } from 'lucide-vue-next';
import { Motion } from 'motion-v';
import { RouterLink } from 'vue-router';

import GlassCard from '@/components/glass-card.vue';
</script>

<template>
  <section class="relative py-24">
    <!-- Background ambient glow -->
    <div class="fixed inset-0 -z-10 overflow-hidden">
      <div
        class="bg-wds-accent/20 absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full blur-[120px]"
      />
      <div
        class="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-purple-500/20 blur-[120px]"
      />
    </div>

    <div class="mx-auto max-w-7xl px-6">
      <div class="mb-16">
        <h2 class="mb-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Bộ sưu tập <span class="text-white/50">độc quyền.</span>
        </h2>
        <p class="max-w-lg text-white/70">
          Khám phá các sản phẩm được thiết kế riêng cho thành viên WebDev Studios với chất lượng cao
          và thiết kế độc đáo.
        </p>
      </div>

      <div class="grid auto-rows-[340px] grid-cols-1 gap-6 md:grid-cols-3">
        <!-- Feature 1: WDS T-shirt (Large) -->
        <GlassCard col-span="md:col-span-2">
          <div
            class="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/5 to-white/2 backdrop-blur-xl"
          >
            <!-- Animated border gradient -->
            <div
              class="from-wds-accent to-wds-accent absolute inset-0 bg-linear-to-r via-purple-500 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-50"
            />
            <!-- Glass shine effect -->
            <div
              class="pointer-events-none absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent"
            />

            <!-- Content -->
            <div class="relative z-10 flex h-full flex-col justify-between p-8">
              <div class="flex-1">
                <div
                  class="border-wds-accent/30 bg-wds-accent/10 text-wds-accent shadow-wds-accent/20 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border shadow-lg"
                >
                  <Shirt class="h-7 w-7" />
                </div>
                <h3 class="mb-2 text-2xl font-bold text-white">Áo thun WebDev Studios</h3>
                <p class="max-w-md text-sm text-white/60">
                  Áo thun chất lượng cao với logo WebDev Studios, size đa dạng. Thiết kế độc đáo.
                </p>
              </div>

              <!-- Product Image with Parallax (Hero-style, larger + stronger hover) -->
              <div class="relative flex justify-end">
                <RouterLink to="/shop/ao-thun" class="cursor-pointer">
                  <Motion
                    class="relative h-60 w-80 md:h-72 md:w-104 lg:h-80 lg:w-120"
                    :while-hover="{ scale: 1.12, y: -16, rotate: -2 }"
                    :transition="{ duration: 0.45, ease: 'easeOut' }"
                    :style="{ transform: 'translateZ(70px)' }"
                  >
                    <div
                      class="from-wds-accent/40 via-wds-accent/15 absolute inset-0 bg-linear-to-t to-transparent blur-3xl"
                    />
                    <img
                      src="/shop/ao-thun.webp"
                      alt="Áo thun WebDev Studios"
                      class="relative z-10 size-full object-contain object-center drop-shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
                    />
                  </Motion>
                </RouterLink>
              </div>
            </div>
          </div>
        </GlassCard>

        <!-- Feature 2: Keychain WebDev Studios -->
        <GlassCard>
          <div
            class="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/5 to-white/2 backdrop-blur-xl"
          >
            <div
              class="absolute inset-0 bg-linear-to-r from-purple-500 via-pink-500 to-purple-500 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-50"
            />
            <div
              class="pointer-events-none absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent"
            />

            <div class="relative z-10 flex h-full flex-col p-6">
              <div
                class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/30 bg-purple-400/10 text-purple-400 shadow-lg shadow-purple-400/20"
              >
                <Circle class="h-6 w-6" />
              </div>
              <h3 class="mb-2 text-xl font-bold text-white">Móc khóa WebDev Studios</h3>
              <p class="mb-4 flex-1 text-sm text-white/60">
                Móc khóa kim loại với logo WebDev Studios, thiết kế độc đáo và bền chắc. Phù hợp để
                treo chìa khóa, túi xách hoặc làm vật trang trí.
              </p>

              <RouterLink to="/shop/moc-khoa" class="cursor-pointer">
                <Motion
                  class="relative mx-auto h-40 w-40"
                  :while-hover="{ scale: 1.1, rotate: 5 }"
                  :transition="{ duration: 0.3 }"
                  :style="{ transform: 'translateZ(40px)' }"
                >
                  <div
                    class="absolute inset-0 bg-linear-to-t from-purple-500/30 to-transparent blur-2xl"
                  />
                  <img
                    src="/shop/moc-khoa.webp"
                    alt="Móc khóa WebDev Studios"
                    class="relative z-10 size-full object-contain object-center drop-shadow-xl"
                  />
                </Motion>
              </RouterLink>
            </div>
          </div>
        </GlassCard>

        <!-- Feature 3: Lanyard WebDev Studios -->
        <GlassCard>
          <div
            class="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/5 to-white/2 backdrop-blur-xl"
          >
            <div
              class="absolute inset-0 bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-50"
            />
            <div
              class="pointer-events-none absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent"
            />

            <div class="relative z-10 flex h-full flex-col p-6">
              <div
                class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 shadow-lg shadow-emerald-400/20"
              >
                <ShoppingBag class="h-6 w-6" />
              </div>
              <h3 class="mb-2 text-xl font-bold text-white">Dây đeo WebDev Studios</h3>
              <p class="mb-4 flex-1 text-sm text-white/60">
                Dây đeo (lanyard) nằm ngang với branding WebDev Studios, tiện lợi cho thẻ nhân viên,
                thẻ hội viên hoặc keychain.
              </p>

              <RouterLink to="/shop/day-deo" class="cursor-pointer">
                <Motion
                  class="relative h-44 w-full"
                  :while-hover="{ scale: 1.06, y: -8 }"
                  :transition="{ duration: 0.3 }"
                  :style="{ transform: 'translateZ(40px)' }"
                >
                  <div
                    class="absolute inset-0 bg-linear-to-t from-emerald-500/30 to-transparent blur-2xl"
                  />
                  <img
                    src="/shop/day-deo.webp"
                    alt="Dây đeo WebDev Studios"
                    class="relative z-10 size-full object-contain object-center drop-shadow-xl"
                  />
                </Motion>
              </RouterLink>
            </div>
          </div>
        </GlassCard>

        <!-- Feature 4: Mouse Pad WebDev Studios Limited Edition (Large) -->
        <GlassCard col-span="md:col-span-2">
          <div
            class="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/5 to-white/2 backdrop-blur-xl"
          >
            <!-- Shimmer effect -->
            <Motion
              class="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent"
              :animate="{ x: ['-100%', '200%'] }"
              :transition="{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'linear' }"
            />

            <div
              class="absolute inset-0 bg-linear-to-r from-amber-500 via-orange-500 to-amber-500 opacity-30 blur-sm"
            />
            <div
              class="pointer-events-none absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent"
            />

            <div class="relative z-10 flex h-full flex-row items-center gap-8 p-8">
              <div class="flex-1">
                <div
                  class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400 shadow-lg shadow-amber-400/20"
                >
                  <Star class="h-7 w-7" />
                </div>
                <div
                  class="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 shadow-lg shadow-amber-400/20"
                >
                  <Motion
                    class="h-2 w-2 rounded-full bg-amber-400"
                    :animate="{ opacity: [0.4, 1, 0.4] }"
                    :transition="{ duration: 2, repeat: Infinity }"
                  />
                  <span class="text-xs font-bold tracking-widest text-amber-300 uppercase">
                    Limited Edition
                  </span>
                </div>
                <h3 class="mb-2 text-2xl font-bold text-white">
                  Pad chuột WebDev Studios Limited Edition
                </h3>
                <p class="text-sm text-white/60">
                  Pad chuột cỡ lớn phiên bản giới hạn với thiết kế WebDev Studios, tối ưu cho
                  developer và designer thường xuyên dùng chuột.
                </p>
              </div>

              <RouterLink to="/shop/pad-chuot" class="hidden cursor-pointer sm:block">
                <Motion
                  class="relative h-56 w-56"
                  :while-hover="{ scale: 1.08, rotate: 360 }"
                  :transition="{ duration: 0.6, ease: 'easeInOut' }"
                  :style="{ transform: 'translateZ(60px)' }"
                >
                  <div
                    class="absolute inset-0 bg-linear-to-t from-amber-500/40 via-orange-500/20 to-transparent blur-3xl"
                  />
                  <Motion
                    class="absolute inset-0 rounded-full border border-amber-400/30"
                    :animate="{ rotate: 360 }"
                    :transition="{ duration: 20, repeat: Infinity, ease: 'linear' }"
                  />
                  <img
                    src="/shop/pad-chuot.webp"
                    alt="Pad chuột WebDev Studios Limited Edition"
                    class="relative z-10 size-full object-contain object-center drop-shadow-2xl"
                  />
                </Motion>
              </RouterLink>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  </section>
</template>

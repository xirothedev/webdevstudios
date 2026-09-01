<script setup lang="ts">
// Port of apps/web src/app/partner. Navbar/Footer are rendered by the shell (App.vue); the
// page-level <main> became a <div> since the shell already wraps RouterView in <main>.
import { ExternalLink, Mail, Zap } from 'lucide-vue-next';
import { motion } from 'motion-v';

import PartnerCard from '@/components/partner/partner-card.vue';
import PartnerHero from '@/components/partner/partner-hero.vue';
import PartnerSection from '@/components/partner/partner-section.vue';
import { COMMUNITY_PARTNERS, MEDIA_PARTNERS, STRATEGIC_PARTNERS } from '@/data/partners';
</script>

<template>
  <div
    class="selection:bg-wds-accent min-h-screen bg-black font-sans text-white selection:text-black"
  >
    <!-- --- BACKGROUND EFFECTS --- -->
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <!-- Retro Grid -->
      <div
        class="absolute inset-0 opacity-20"
        :style="{
          backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black, transparent 80%)',
        }"
      />

      <!-- Orange Glow Orbs -->
      <div
        class="bg-wds-accent/10 absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full blur-[120px]"
      />
      <div
        class="bg-wds-accent/5 absolute top-[40%] right-[-10%] h-[500px] w-[500px] rounded-full blur-[100px]"
      />
    </div>

    <div class="relative z-10 pt-32 pb-20">
      <!-- --- HERO SECTION --- -->
      <PartnerHero />

      <!-- --- STRATEGIC PARTNERS --- -->
      <section class="mx-auto mb-24 max-w-6xl px-6">
        <PartnerSection
          label="Hạng Kim Cương & Vàng"
          title="Đối Tác Chiến Lược"
          subtitle="Những đơn vị đã đồng hành sâu sắc cùng WDS trong các sự kiện lớn và định hướng phát triển."
        />

        <motion.div
          initial="hidden"
          while-in-view="visible"
          :viewport="{ once: true }"
          :variants="{ visible: { transition: { staggerChildren: 0.1 } } }"
          class="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          <PartnerCard
            v-for="partner in STRATEGIC_PARTNERS"
            :key="partner.id"
            :partner="partner"
            size="lg"
          />
        </motion.div>
      </section>

      <!-- --- COMMUNITY PARTNERS --- -->
      <section class="mx-auto mb-24 max-w-6xl px-6">
        <PartnerSection label="Hệ sinh thái" title="Đối Tác Cộng Đồng & Giáo Dục" />

        <motion.div
          initial="hidden"
          while-in-view="visible"
          :viewport="{ once: true }"
          :variants="{ visible: { transition: { staggerChildren: 0.05 } } }"
          class="grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          <PartnerCard
            v-for="partner in COMMUNITY_PARTNERS"
            :key="partner.id"
            :partner="partner"
            size="md"
          />
        </motion.div>
      </section>

      <!-- --- MEDIA PARTNERS --- -->
      <section class="mx-auto mb-32 max-w-6xl px-6">
        <div
          class="relative overflow-hidden rounded-3xl border border-white/10 bg-white/2 p-8 md:p-12"
        >
          <div class="pointer-events-none absolute top-0 right-0 p-12 opacity-10">
            <Zap :size="200" class="text-wds-accent" />
          </div>

          <div
            class="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center"
          >
            <div class="max-w-md">
              <h3 class="mb-2 text-2xl font-bold">Bảo Trợ Truyền Thông</h3>
              <p class="text-sm text-gray-400">
                Cảm ơn các đơn vị báo chí và CLB bạn đã giúp lan tỏa giá trị của WDS tới cộng đồng.
              </p>
            </div>

            <div class="flex flex-wrap gap-3">
              <div
                v-for="partner in MEDIA_PARTNERS"
                :key="partner.id"
                class="hover:border-wds-accent/50 hover:text-wds-accent flex cursor-default items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-gray-300 transition-colors"
              >
                <component :is="partner.icon" :size="24" />
                <span>{{ partner.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- --- CTA / JOIN US --- -->
      <section class="px-6" id="contact">
        <div class="mx-auto max-w-5xl">
          <div
            class="bg-wds-accent relative overflow-hidden rounded-3xl px-6 py-16 text-center md:px-20 md:py-20"
          >
            <!-- Decorative patterns -->
            <div
              class="absolute inset-0 opacity-10"
              :style="{
                backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }"
            ></div>
            <div
              class="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white opacity-20 blur-3xl"
            ></div>
            <div
              class="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-black opacity-10 blur-3xl"
            ></div>

            <div class="relative z-10">
              <h2 class="mb-6 text-3xl font-bold text-balance text-black sm:text-4xl">
                Sẵn sàng đồng hành cùng thế hệ Web Developer tiếp theo?
              </h2>
              <p class="mx-auto mb-8 max-w-2xl text-lg font-medium text-pretty text-black/70">
                Hãy trở thành đối tác của WebDev Studios để tiếp cận nguồn nhân lực chất lượng cao
                và lan tỏa thương hiệu của bạn tại UIT.
              </p>
              <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  class="group flex h-12 items-center justify-center gap-2 rounded-full bg-black px-8 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-900 hover:shadow-xl"
                >
                  <Mail :size="16" /> Liên hệ tài trợ
                </button>
                <button
                  class="flex h-12 items-center justify-center gap-2 rounded-full border border-black/20 bg-transparent px-8 text-sm font-semibold text-black transition hover:bg-black/5"
                >
                  <ExternalLink :size="16" /> Xem Hồ sơ năng lực
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

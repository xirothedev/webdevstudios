<script setup lang="ts">
// Port of apps/web src/app/activities. Navbar/Footer are rendered by the shell (App.vue); the
// page-level <main> became a <div> since the shell already wraps RouterView in <main>.
import { Search } from 'lucide-vue-next';
import { AnimatePresence, motion } from 'motion-v';
import { computed, ref } from 'vue';

import ActivityCard from '@/components/activities/activity-card.vue';
import ActivityFilters from '@/components/activities/activity-filters.vue';
import ActivityHero from '@/components/activities/activity-hero.vue';
import NewsletterCTA from '@/components/activities/newsletter-cta.vue';
import { ACTIVITIES, CATEGORIES } from '@/data/activities';

const activeCategory = ref('all');
const searchQuery = ref('');

const filteredActivities = computed(() =>
  ACTIVITIES.filter((item) => {
    const matchesCategory =
      activeCategory.value === 'all' || item.category === activeCategory.value;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCategory && matchesSearch;
  }),
);
</script>

<template>
  <div
    class="selection:bg-wds-accent min-h-screen bg-black font-sans text-white selection:text-black"
  >
    <!-- --- BACKGROUND --- -->
    <div class="pointer-events-none fixed inset-0 z-0">
      <div
        class="absolute inset-0 opacity-20"
        :style="{
          backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(circle at top center, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at top center, black 30%, transparent 80%)',
        }"
      />
    </div>

    <div class="relative z-10 pt-32 pb-20">
      <!-- --- HEADER --- -->
      <ActivityHero />

      <!-- --- CONTROLS --- -->
      <section class="mb-16 px-6">
        <div class="mx-auto max-w-7xl">
          <ActivityFilters
            :active-category="activeCategory"
            :search-query="searchQuery"
            :categories="CATEGORIES"
            @select-category="activeCategory = $event"
            @update-search="searchQuery = $event"
          />
        </div>
      </section>

      <!-- --- GRID --- -->
      <section class="min-h-[500px] px-6">
        <div class="mx-auto max-w-7xl">
          <motion.div layout class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              <ActivityCard
                v-for="activity in filteredActivities"
                :key="activity.id"
                :activity="activity"
              />
              <motion.div
                v-if="filteredActivities.length === 0"
                :initial="{ opacity: 0 }"
                :animate="{ opacity: 1 }"
                class="col-span-full py-20 text-center"
              >
                <div class="mb-4 inline-flex rounded-full bg-white/5 p-4 text-gray-500">
                  <Search :size="32" />
                </div>
                <p class="text-lg text-gray-400">Không tìm thấy hoạt động nào phù hợp.</p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <!-- --- NEWSLETTER CTA --- -->
      <NewsletterCTA />
    </div>
  </div>
</template>

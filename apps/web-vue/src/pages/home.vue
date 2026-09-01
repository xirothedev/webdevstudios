<script setup lang="ts">
// Port of apps/web src/app/page.tsx. Navbar/Footer are rendered by the shell (App.vue).
import WDSClientsSection from '@/components/wds/clients-section.vue';
import WDSContactGrid from '@/components/wds/contact-grid.vue';
import WDSHero from '@/components/wds/hero.vue';
import WDSMissionSection from '@/components/wds/mission-section.vue';
import WDSStatsSection from '@/components/wds/stats-section.vue';
</script>

<template>
  <div class="min-h-screen bg-white">
    <WDSHero />
    <WDSContactGrid />
    <WDSClientsSection />
    <WDSMissionSection />
    <WDSStatsSection />
  </div>
</template>

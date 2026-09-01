<script setup lang="ts">
import FeaturesGrid from '@/components/FeaturesGrid.vue';
import Hero from '@/components/Hero.vue';
import TrustSection from '@/components/TrustSection.vue';
import { SEO_IMAGES, usePageMeta } from '@/lib/metadata';

usePageMeta({
  title: 'E-commerce Platform',
  description:
    'Khám phá nền tảng thương mại điện tử hiện đại với giao diện đẹp mắt và trải nghiệm người dùng tuyệt vời.',
  path: '/shop',
  image: SEO_IMAGES['/shop'],
  keywords: ['E-commerce', 'Thương mại điện tử', 'E-commerce platform', 'Mua sắm online'],
});
</script>

<template>
  <!-- apps/web shop/page.tsx: Navbar + Hero + TrustSection + FeaturesGrid + Footer; the shell provides the chrome -->
  <div
    class="bg-wds-background text-wds-text selection:bg-wds-accent/30 selection:text-wds-text min-h-screen"
  >
    <Hero />
    <TrustSection />
    <FeaturesGrid />
  </div>
</template>

<script setup lang="ts">
// Port of apps/web src/app/about. Navbar/Footer are rendered by the shell (App.vue).
import WDSAboutHero from '@/components/wds/about-hero.vue';
import WDSAboutSections from '@/components/wds/about-sections.vue';
import { SEO_IMAGES, usePageMeta } from '@/lib/metadata';

usePageMeta({
  title: 'Về chúng tôi',
  description:
    'Tìm hiểu về WebDev Studios - Câu lạc bộ lập trình web của sinh viên UIT. Tiểu sử, định hướng, tầm nhìn, sứ mệnh và phạm vi hoạt động của chúng tôi.',
  path: '/about',
  image: SEO_IMAGES['/about'],
  keywords: [
    'Về WebDev Studios',
    'Giới thiệu WebDev Studios',
    'Câu lạc bộ UIT',
    'Lịch sử WebDev Studios',
  ],
});
</script>

<template>
  <div class="min-h-screen bg-white">
    <WDSAboutHero />
    <WDSAboutSections />
  </div>
</template>

<script setup lang="ts">
import { SEO_IMAGES, usePageMeta } from '@/lib/metadata';

// apps/web /shop renders Hero + TrustSection + FeaturesGrid (marketing components owned
// by T4, not yet ported). Wire those three imports here when they land.
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
  <div
    class="bg-wds-background text-wds-text selection:bg-wds-accent/30 selection:text-wds-text min-h-screen"
  />
</template>

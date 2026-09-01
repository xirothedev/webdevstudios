<script setup lang="ts">
import ProductPageContent from '@/components/shop/product-page-content.vue';
import { usePageMeta } from '@/lib/metadata';

usePageMeta({
  title: 'Dây đeo WebDev Studios',
  description:
    'Dây đeo (lanyard) nằm ngang với branding WebDev Studios, tiện lợi cho thẻ nhân viên, thẻ hội viên hoặc keychain. Chất liệu bền chắc, thiết kế chuyên nghiệp.',
  path: '/shop/day-deo',
  keywords: ['Dây đeo WDS', 'Lanyard WebDev Studios', 'Dây đeo thẻ nhân viên', 'Merchandise UIT'],
});
</script>

<template>
  <ProductPageContent product-slug="day-deo" product-name="Dây đeo" />
</template>

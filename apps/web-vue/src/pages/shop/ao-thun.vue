<script setup lang="ts">
import ProductPageContent from '@/components/shop/product-page-content.vue';
import { SEO_IMAGES, usePageMeta } from '@/lib/metadata';

usePageMeta({
  title: 'Áo thun WebDev Studios',
  description:
    'Áo thun chất lượng cao với logo WebDev Studios, size đa dạng. Thiết kế độc đáo dành riêng cho thành viên câu lạc bộ.',
  path: '/shop/ao-thun',
  image: SEO_IMAGES['/shop/ao-thun'],
  keywords: ['Áo thun WDS', 'WebDev Studios', 'Áo thun câu lạc bộ', 'Merchandise UIT'],
});
</script>

<template>
  <ProductPageContent product-slug="ao-thun" product-name="Áo thun" />
</template>

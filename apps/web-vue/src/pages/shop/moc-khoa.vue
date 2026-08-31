<script setup lang="ts">
import ProductPageContent from '@/components/shop/product-page-content.vue';
import { SEO_IMAGES, usePageMeta } from '@/lib/metadata';

usePageMeta({
  title: 'Móc khóa WebDev Studios',
  description:
    'Móc khóa kim loại với logo WebDev Studios, thiết kế độc đáo và bền chắc. Phù hợp để treo chìa khóa, túi xách hoặc làm vật trang trí.',
  path: '/shop/moc-khoa',
  image: SEO_IMAGES['/shop/moc-khoa'],
  keywords: ['Móc khóa WDS', 'WebDev Studios', 'Keychain WebDev Studios', 'Merchandise UIT'],
});
</script>

<template>
  <ProductPageContent product-slug="moc-khoa" product-name="Móc khóa" />
</template>

<script setup lang="ts">
import ProductPageContent from '@/components/shop/product-page-content.vue';
import { usePageMeta } from '@/lib/metadata';

usePageMeta({
  title: 'Pad chuột WebDev Studios Limited Edition',
  description:
    'Pad chuột cỡ lớn phiên bản giới hạn với thiết kế WebDev Studios, tối ưu cho developer và designer thường xuyên dùng chuột.',
  path: '/shop/pad-chuot',
  keywords: ['Pad chuột WDS', 'WebDev Studios', 'Mouse pad Limited Edition', 'Pad chuột developer'],
});
</script>

<template>
  <ProductPageContent product-slug="pad-chuot" product-name="Pad chuột" />
</template>

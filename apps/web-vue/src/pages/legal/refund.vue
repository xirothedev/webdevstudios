<script setup lang="ts">
// Port of apps/web src/app/(legal)/refund — content.mdx copied to refund.md (LastUpdated dropped
// per spec: no git commit dates in the SPA). Rendered with marked, heading ids slugified for the TOC.
import { computed } from 'vue';

import LegalLayout from '@/components/legal/legal-layout.vue';
import { SEO_IMAGES, usePageMeta } from '@/lib/metadata';
import { renderLegalMarkdown } from './markdown';
import contentSrc from './refund.md?raw';

usePageMeta({
  title: 'Chính sách đổi trả và hoàn tiền',
  description:
    'Chính sách đổi trả và hoàn tiền của WebDev Studios - Quy định và quy trình đổi trả sản phẩm.',
  path: '/refund',
  image: SEO_IMAGES['/refund'],
  keywords: ['Chính sách đổi trả', 'Refund Policy', 'WebDev Studios', 'Hoàn tiền'],
});

const TOC_ITEMS = [
  { id: 'chinh-sach-doi-tra-va-hoan-tien', label: 'Chính sách đổi trả và hoàn tiền' },
  { id: '1-gioi-thieu', label: '1. Giới thiệu' },
  { id: '2-dieu-kien-doi-tra', label: '2. Điều kiện đổi trả' },
  { id: '3-quy-trinh-doi-tra', label: '3. Quy trình đổi trả' },
  { id: '4-cac-hinh-thuc-doi-tra', label: '4. Các hình thức đổi trả' },
  { id: '5-quy-trinh-hoan-tien', label: '5. Quy trình hoàn tiền' },
  { id: '6-san-pham-loi-hoac-khong-dung-mo-ta', label: '6. Sản phẩm lỗi hoặc không đúng mô tả' },
  { id: '7-huy-don-hang', label: '7. Hủy đơn hàng' },
  { id: '8-quy-dinh-dac-biet', label: '8. Quy định đặc biệt' },
  { id: '9-lien-he', label: '9. Liên hệ' },
  { id: '10-thay-doi-chinh-sach', label: '10. Thay đổi chính sách' },
  { id: '11-dong-y', label: '11. Đồng ý' },
];

const html = computed(() => renderLegalMarkdown(contentSrc));
</script>

<template>
  <div
    class="bg-wds-background text-wds-text selection:bg-wds-accent/30 selection:text-wds-text min-h-screen"
  >
    <main class="py-20">
      <LegalLayout title="Chính sách đổi trả và hoàn tiền" :toc="TOC_ITEMS">
        <div v-html="html" />
      </LegalLayout>
    </main>
  </div>
</template>

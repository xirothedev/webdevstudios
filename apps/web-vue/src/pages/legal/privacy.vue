<script setup lang="ts">
// Port of apps/web src/app/(legal)/privacy — content.mdx copied to privacy.md (LastUpdated dropped
// per spec: no git commit dates in the SPA). Rendered with marked, heading ids slugified for the TOC.
import { computed } from 'vue';

import LegalLayout from '@/components/legal/legal-layout.vue';
import { SEO_IMAGES, usePageMeta } from '@/lib/metadata';
import { renderLegalMarkdown } from './markdown';
import contentSrc from './privacy.md?raw';

usePageMeta({
  title: 'Chính sách quyền riêng tư',
  description:
    'Chính sách quyền riêng tư của WebDev Studios - Cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.',
  path: '/privacy',
  image: SEO_IMAGES['/privacy'],
  keywords: ['Chính sách quyền riêng tư', 'Privacy Policy', 'WebDev Studios', 'Bảo mật'],
});

const TOC_ITEMS = [
  { id: 'chinh-sach-quyen-rieng-tu', label: 'Chính sách quyền riêng tư' },
  { id: '1-gioi-thieu', label: '1. Giới thiệu' },
  { id: '2-thong-tin-chung-toi-thu-thap', label: '2. Thông tin chúng tôi thu thập' },
  { id: '3-cach-chung-toi-su-dung-thong-tin', label: '3. Cách chúng tôi sử dụng thông tin' },
  { id: '4-chia-se-thong-tin', label: '4. Chia sẻ thông tin' },
  { id: '5-bao-mat-thong-tin', label: '5. Bảo mật thông tin' },
  { id: '6-cookies-va-cong-nghe-theo-doi', label: '6. Cookies và công nghệ theo dõi' },
  { id: '7-quyen-cua-ban', label: '7. Quyền của bạn' },
  { id: '8-luu-tru-du-lieu', label: '8. Lưu trữ dữ liệu' },
  { id: '9-tre-em', label: '9. Trẻ em' },
  { id: '10-thay-doi-chinh-sach', label: '10. Thay đổi chính sách' },
  { id: '11-lien-he', label: '11. Liên hệ' },
  { id: '12-dong-y', label: '12. Đồng ý' },
];

const html = computed(() => renderLegalMarkdown(contentSrc));
</script>

<template>
  <div
    class="bg-wds-background text-wds-text selection:bg-wds-accent/30 selection:text-wds-text min-h-screen"
  >
    <main class="py-20">
      <LegalLayout title="Chính sách quyền riêng tư" :toc="TOC_ITEMS">
        <div v-html="html" />
      </LegalLayout>
    </main>
  </div>
</template>

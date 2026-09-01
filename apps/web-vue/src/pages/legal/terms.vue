<script setup lang="ts">
// Port of apps/web src/app/(legal)/terms — content.mdx copied to terms.md (LastUpdated dropped
// per spec: no git commit dates in the SPA). Rendered with marked, heading ids slugified for the TOC.
import { computed } from 'vue';

import LegalLayout from '@/components/legal/legal-layout.vue';
import { usePageMeta } from '@/lib/metadata';
import { renderLegalMarkdown } from './markdown';
import contentSrc from './terms.md?raw';

usePageMeta({
  title: 'Điều khoản sử dụng',
  description:
    'Điều khoản sử dụng của WebDev Studios - Quy định và điều kiện khi sử dụng website và dịch vụ của chúng tôi.',
  path: '/terms',
  keywords: ['Điều khoản sử dụng', 'Terms of Service', 'WebDev Studios', 'Quy định'],
});

const TOC_ITEMS = [
  { id: 'dieu-khoan-su-dung', label: 'Điều khoản sử dụng' },
  { id: '1-gioi-thieu', label: '1. Giới thiệu' },
  { id: '2-dinh-nghia', label: '2. Định nghĩa' },
  { id: '3-chap-nhan-dieu-khoan', label: '3. Chấp nhận điều khoản' },
  { id: '4-dang-ky-tai-khoan', label: '4. Đăng ký tài khoản' },
  { id: '5-su-dung-dich-vu', label: '5. Sử dụng dịch vụ' },
  { id: '6-mua-sam-va-thanh-toan', label: '6. Mua sắm và thanh toán' },
  { id: '7-so-huu-tri-tue', label: '7. Sở hữu trí tuệ' },
  { id: '8-noi-dung-nguoi-dung', label: '8. Nội dung người dùng' },
  { id: '9-tu-choi-trach-nhiem', label: '9. Từ chối trách nhiệm' },
  { id: '10-boi-thuong', label: '10. Bồi thường' },
  { id: '11-cham-dut', label: '11. Chấm dứt' },
  { id: '12-thay-doi-dieu-khoan', label: '12. Thay đổi điều khoản' },
  { id: '13-luat-ap-dung', label: '13. Luật áp dụng' },
  { id: '14-lien-he', label: '14. Liên hệ' },
];

const html = computed(() => renderLegalMarkdown(contentSrc));
</script>

<template>
  <div
    class="bg-wds-background text-wds-text selection:bg-wds-accent/30 selection:text-wds-text min-h-screen"
  >
    <main class="py-20">
      <LegalLayout title="Điều khoản sử dụng" :toc="TOC_ITEMS">
        <div v-html="html" />
      </LegalLayout>
    </main>
  </div>
</template>

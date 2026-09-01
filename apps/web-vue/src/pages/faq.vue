<script setup lang="ts">
// Port of apps/web src/app/faq. Navbar/Footer are rendered by the shell (App.vue).
import { faqItems } from '@/data/faq';
import { usePageMeta } from '@/lib/metadata';

usePageMeta({
  title: 'FAQ',
  description:
    'Câu hỏi thường gặp về WebDev Studios: tuyển thành viên, hoạt động, cơ hội phát triển và cách tham gia câu lạc bộ.',
  path: '/faq',
  keywords: ['FAQ WebDev Studios', 'Câu hỏi thường gặp', 'CLB lập trình web'],
});
</script>

<template>
  <div class="min-h-screen bg-white">
    <section class="to-wds-secondary/30 bg-linear-to-b from-white via-white">
      <div class="mx-auto flex max-w-6xl flex-col gap-10 px-6 pt-20 pb-16">
        <div class="flex flex-col gap-4 text-center">
          <span class="text-wds-accent text-sm font-semibold tracking-wide uppercase">FAQ</span>
          <h1 class="text-3xl leading-tight font-bold text-balance text-black sm:text-4xl">
            Giải đáp nhanh những câu hỏi về WebDev Studios
          </h1>
          <p class="text-base text-pretty text-gray-600 sm:text-lg">
            Tất cả thông tin về tuyển thành viên, hoạt động, cơ hội học tập và dự án. Nếu bạn còn
            câu hỏi khác, hãy liên hệ để được hỗ trợ ngay.
          </p>

          <div class="mx-auto flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:webdevstudios.org@gmail.com"
              class="bg-wds-accent hover:bg-wds-accent/90 shadow-wds-accent/30 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-black transition hover:shadow-md"
            >
              Gửi email
            </a>
            <a
              href="https://facebook.com/webdevstudios.org"
              target="_blank"
              rel="noopener noreferrer"
              class="border-wds-accent text-wds-accent hover:bg-wds-accent/10 inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition"
            >
              Nhắn tin fanpage
            </a>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="item in faqItems"
            :key="item.question"
            class="group bg-wds-accent/10 border-wds-accent/30 hover:border-wds-accent/60 shadow-wds-accent/10 hover:shadow-wds-accent/20 relative flex flex-col gap-3 rounded-2xl border px-5 py-4 transition-shadow duration-200"
          >
            <h2 class="text-base leading-snug font-semibold text-black">{{ item.question }}</h2>
            <p class="text-sm leading-relaxed text-gray-700">{{ item.answer }}</p>
          </article>
        </div>

        <div
          class="border-wds-accent/30 shadow-wds-accent/20 relative flex flex-col gap-3 rounded-2xl border bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p class="text-sm font-semibold text-black">
              Cần hỗ trợ thêm? Chúng tôi luôn sẵn sàng.
            </p>
            <p class="text-sm text-gray-600">
              Gọi trực tiếp Chủ nhiệm: <span class="font-semibold">0794161275</span> hoặc email:
              <span class="font-semibold">webdevstudios.org@gmail.com</span>
            </p>
          </div>
          <div class="flex flex-wrap gap-3">
            <a
              href="tel:0794161275"
              class="bg-wds-accent hover:bg-wds-accent/90 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-black transition"
            >
              Gọi ngay
            </a>
            <RouterLink
              to="/about"
              class="border-wds-accent text-wds-accent hover:bg-wds-accent/10 inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition"
            >
              Về chúng tôi
            </RouterLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Port of apps/web src/components/wds/ContactGrid.tsx (WDSContactGrid).
import { AnimatePresence, m } from 'motion-v';
import { Building2, Clock, Mail, MessageCircle, Phone } from 'lucide-vue-next';
import { h, ref } from 'vue';

import OnlineBeamBackground from '@/components/wds/online-beam-background.vue';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid.vue';
import { Button } from '@/components/ui/button.vue';

const isDialogOpen = ref(false);

// Card backgrounds (JSX background prop in the React original → h() render fns).
const photoBg = (src: string) =>
  h('div', { class: 'absolute inset-0' }, [
    h('div', {
      class: `blur-0 absolute inset-0 scale-105 bg-[url('${src}')] bg-cover bg-center opacity-50`,
    }),
    h('div', { class: 'absolute inset-0 bg-linear-to-br from-white/80 via-white/60 to-white/30' }),
  ]);

const contacts = [
  {
    Icon: Building2,
    name: 'Văn phòng',
    description: 'B8.04, tòa B, Đại học Công nghệ Thông Tin, ĐHQG TP.HCM',
    href: 'https://maps.google.com/?q=Đại+học+Công+nghệ+Thông+Tin+ĐHQG+TP.HCM',
    cta: 'Xem bản đồ',
    className: 'col-span-3 lg:col-span-2',
    background: () => photoBg('/image/uit-school.webp'),
    onClick: undefined as (() => void) | undefined,
  },
  {
    Icon: Phone,
    name: 'Liên hệ công việc',
    description: 'Chủ nhiệm - Lâm Chí Dĩnh: 0794161275',
    href: 'tel:0794161275',
    cta: 'Gửi email',
    className: 'col-span-3 lg:col-span-1',
    background: () => photoBg('/image/chunhiem-lamchidinh.webp'),
    onClick: undefined as (() => void) | undefined,
  },
  {
    Icon: Clock,
    name: 'Giờ mở cửa',
    description: '7h30 - 15h30',
    href: '#',
    cta: 'Xem chi tiết',
    className: 'col-span-3 lg:col-span-1',
    background: () => photoBg('/image/ceremony-20-12-2025.webp'),
    onClick: undefined as (() => void) | undefined,
  },
  {
    Icon: MessageCircle,
    name: 'Kênh trực tuyến',
    description: 'Kết nối qua Fanpage, Email hoặc Messenger',
    href: undefined as string | undefined,
    cta: 'Chọn kênh',
    className: 'col-span-3 lg:col-span-2',
    background: () => h(OnlineBeamBackground),
    onClick: () => (isDialogOpen.value = true),
  },
];
</script>

<template>
  <section
    class="relative flex snap-start items-center overflow-hidden bg-linear-to-b from-white to-gray-50 py-16 md:py-24"
  >
    <!-- Background decoration -->
    <div class="absolute inset-0 -z-10">
      <div
        class="bg-wds-secondary absolute top-0 left-1/4 size-64 rounded-full opacity-20 blur-[100px]"
      ></div>
      <div
        class="bg-wds-accent/10 absolute right-1/4 bottom-0 size-48 rounded-full opacity-15 blur-[80px]"
      ></div>
    </div>

    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Section header -->
      <m.div
        class="mb-12 text-center"
        :initial="{ opacity: 0, y: 20 }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :viewport="{ once: true }"
        :transition="{ duration: 0.6 }"
      >
        <h2 class="text-3xl font-semibold text-black sm:text-4xl md:text-5xl">
          Liên hệ với chúng tôi
        </h2>
        <div class="from-wds-accent to-wds-accent/50 mx-auto mt-4 h-1 w-20 bg-linear-to-r"></div>
        <p class="mx-auto mt-6 max-w-2xl text-base text-gray-600 sm:text-lg">
          Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các kênh
          sau:
        </p>
      </m.div>

      <!-- Bento Grid -->
      <BentoGrid class="md:auto-rows-72">
        <BentoCard v-for="contact in contacts" :key="contact.name" v-bind="contact" />
      </BentoGrid>
    </div>

    <div v-if="isDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Đóng hộp thoại chọn kênh liên hệ"
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="isDialogOpen = false"
      />
      <AnimatePresence>
        <m.div
          :initial="{ opacity: 0, scale: 0.95 }"
          :animate="{ opacity: 1, scale: 1 }"
          :exit="{ opacity: 0, scale: 0.95 }"
          class="relative z-10 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
        >
          <div class="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 class="text-xl font-semibold text-neutral-900">Chọn kênh liên hệ</h3>
              <p class="text-sm text-neutral-600">
                Kết nối nhanh qua Fanpage, Email hoặc Messenger.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              class="rounded-full bg-neutral-100 text-sm font-medium text-neutral-700! hover:bg-neutral-200"
              @click="isDialogOpen = false"
            >
              Đóng
            </Button>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <a
              href="https://facebook.com"
              class="group flex flex-col gap-2 rounded-xl border border-neutral-100 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div class="flex items-center gap-2">
                <MessageCircle class="text-wds-accent size-5" />
                <span class="text-sm font-semibold text-neutral-800">Fanpage</span>
              </div>
              <p class="text-xs text-neutral-600">Cập nhật sự kiện và tin mới nhất.</p>
            </a>

            <a
              href="mailto:webdevstudios.org@gmail.com"
              class="group flex flex-col gap-2 rounded-xl border border-neutral-100 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div class="flex items-center gap-2">
                <Mail class="text-wds-accent size-5" />
                <span class="text-sm font-semibold text-neutral-800">Email</span>
              </div>
              <p class="text-xs text-neutral-600">Gửi mail để được phản hồi chi tiết.</p>
            </a>

            <a
              href="https://m.me"
              class="group flex flex-col gap-2 rounded-xl border border-neutral-100 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div class="flex items-center gap-2">
                <MessageCircle class="text-wds-accent size-5" />
                <span class="text-sm font-semibold text-neutral-800">Messenger</span>
              </div>
              <p class="text-xs text-neutral-600">Chat nhanh với đội ngũ hỗ trợ.</p>
            </a>
          </div>
        </m.div>
      </AnimatePresence>
    </div>
  </section>
</template>

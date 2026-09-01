<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import { contactInfo, footerSections } from '@/data/footer';

// Port of apps/web Footer.tsx. <a> is used for external/mailto/tel hrefs, RouterLink for /paths.
const props = withDefaults(defineProps<{ variant?: 'dark' | 'light' }>(), { variant: 'dark' });
const isDark = computed(() => props.variant === 'dark');
const isInternal = (href: string) => href.startsWith('/');
</script>

<template>
  <footer
    :class="`${isDark ? 'bg-wds-background border-white/5' : 'border-gray-200 bg-white'} border-t py-12`"
  >
    <div class="mx-auto max-w-7xl px-6">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div>
          <div class="mb-4 flex items-center gap-2">
            <div class="relative h-5 w-5">
              <img src="/image/wds-logo.svg" alt="WebDev Studios" class="object-contain" />
            </div>
            <span :class="`text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`">
              WebDev Studios
            </span>
          </div>
          <p :class="`text-xs ${isDark ? 'text-white/70' : 'text-gray-600'}`">
            WebDev Studios là nơi tập hợp các bạn sinh viên có niềm đam mê với Lập trình Web nhằm
            tạo ra một môi trường học tập và giải trí để các bạn có thể học hỏi, trau dồi kỹ năng và
            phát triển bản thân.
          </p>
        </div>

        <div v-for="section in footerSections" :key="section.title">
          <h3 :class="`mb-4 text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`">
            {{ section.title }}
          </h3>
          <ul :class="`space-y-2 text-xs ${isDark ? 'text-white/70' : 'text-gray-600'}`">
            <li v-for="link in section.links" :key="link.label">
              <RouterLink
                v-if="isInternal(link.href)"
                :to="link.href"
                :target="link.target"
                :rel="link.rel"
                class="hover:text-wds-accent transition-colors"
              >
                {{ link.label }}
              </RouterLink>
              <a
                v-else
                :href="link.href"
                :target="link.target"
                :rel="link.rel"
                class="hover:text-wds-accent transition-colors"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 :class="`mb-4 text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`">
            LIÊN HỆ
          </h3>
          <ul :class="`space-y-2 text-xs ${isDark ? 'text-white/70' : 'text-gray-600'}`">
            <li v-for="(item, index) in contactInfo" :key="index">
              <template v-if="item.href">
                <span class="font-medium">{{ item.label }}</span>
                <a
                  :href="item.href"
                  :target="item.target"
                  :rel="item.rel"
                  class="hover:text-wds-accent transition-colors"
                >
                  {{ item.content }}
                </a>
              </template>
              <template v-else>
                <span class="font-medium">{{ item.label }}</span> {{ item.content }}
              </template>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="mt-10 space-y-2 text-center text-xs text-gray-500">
      <div>© 2025 WebDev Studios. All rights reserved.</div>
      <div class="flex items-center justify-center gap-2">
        <span>Developed &amp; Designed by</span>
        <a href="mailto:working@xirothedev.site" class="hover:text-wds-accent transition-colors">
          Xiro The Dev
        </a>
        <span>•</span>
        <a
          href="https://github.com/xirothedev"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-wds-accent transition-colors"
        >
          github/xirothedev
        </a>
      </div>
    </div>
  </footer>
</template>

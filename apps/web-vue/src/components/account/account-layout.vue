<script setup lang="ts">
// Port of apps/web src/components/account/{AccountLayout,AccountHero,AccountSidebar}.tsx.
// Navbar/Footer come from the App.vue shell (deviation: shell Navbar is dark, apps/web used
// the light variant here).
import { useRoute, RouterLink } from 'vue-router';
import { Settings, User, type LucideIcon } from 'lucide-vue-next';

import AvatarUpload from '@/components/account/avatar-upload.vue';
import { useUserProfile } from '@/lib/api/hooks/use-user';

defineProps<{
  title: string;
  description: string;
  icon: LucideIcon;
  label: string;
  error?: { title: string; message: string };
}>();

const route = useRoute();
const { data: user } = useUserProfile();

const NAV_ITEMS = [
  { href: '/account/profile', label: 'Hồ sơ', icon: User },
  { href: '/account/settings', label: 'Cài đặt', icon: Settings },
];
</script>

<template>
  <div class="min-h-screen bg-white">
    <template v-if="error">
      <div class="flex min-h-[60vh] items-center justify-center">
        <div class="flex flex-col items-center gap-4 text-center">
          <p class="text-base font-semibold text-gray-900">{{ error.title }}</p>
          <p class="text-sm text-gray-600">{{ error.message }}</p>
        </div>
      </div>
    </template>

    <template v-else>
      <section class="relative overflow-hidden py-16 sm:py-20">
        <div
          class="via-wds-secondary/10 to-wds-secondary/20 absolute inset-0 bg-linear-to-b from-white"
        />
        <div class="relative mx-auto max-w-4xl px-4 sm:px-6">
          <div class="mb-12 flex flex-col gap-4 text-center sm:mb-16 sm:gap-6">
            <div class="inline-flex items-center justify-center gap-2">
              <component :is="icon" class="text-wds-accent h-5 w-5" />
              <span class="text-wds-accent text-sm font-bold tracking-widest uppercase">{{
                label
              }}</span>
            </div>
            <h1 class="text-3xl leading-tight font-black text-balance text-black sm:text-4xl">
              {{ title }}
            </h1>
            <p class="mx-auto max-w-2xl text-sm text-pretty text-gray-600 sm:text-base">
              {{ description }}
            </p>
          </div>
        </div>
      </section>

      <section class="relative">
        <div class="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div class="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8">
            <div class="shrink-0 lg:w-64">
              <div class="space-y-6">
                <div
                  v-if="user"
                  class="bg-wds-accent/5 border-wds-accent/20 rounded-2xl border p-6"
                >
                  <AvatarUpload :user="user" />
                </div>

                <nav class="bg-wds-accent/5 border-wds-accent/20 rounded-2xl border p-4">
                  <ul class="space-y-2">
                    <li v-for="item in NAV_ITEMS" :key="item.href">
                      <RouterLink
                        :to="item.href"
                        class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
                        :class="
                          route.path === item.href
                            ? 'bg-wds-accent text-black'
                            : 'hover:bg-wds-accent/10 text-gray-700 hover:text-gray-900'
                        "
                      >
                        <component :is="item.icon" class="h-5 w-5 shrink-0" />
                        <span>{{ item.label }}</span>
                      </RouterLink>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>

            <div class="min-w-0 flex-1"><slot /></div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Menu, X } from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu.vue';
import UserAvatar from '@/components/wds/user-avatar.vue';
import { useCurrentUser } from '@/lib/api/hooks/use-auth';
import { cn } from 'cn';

// Port of apps/web Navbar.tsx. ponytail: motion-v open/close animations dropped for v-if —
// add <Motion> wrappers back if the sidebar transition matters.
const props = withDefaults(defineProps<{ variant?: 'dark' | 'light' }>(), { variant: 'dark' });
const route = useRoute();
const isDark = computed(() => props.variant === 'dark');
const isMobileMenuOpen = ref(false);
// mounted gate: avatar only after client render (was useSyncExternalStore in React)
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});
const { data: user } = useCurrentUser();

const navItems = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Về chúng tôi', href: '/about' },
  { label: 'Thành tích', href: '/achievements' },
  { label: 'Hoạt động', href: '/activities' },
  { label: 'Đối tác', href: '/partner' },
  { label: 'Blog', href: '/blog' },
  { label: 'Shop', href: '/shop' },
  { label: 'Lịch sự kiện', href: '/calendar' },
  { label: 'Thế hệ', href: '/generation' },
  { label: 'FAQ', href: '/faq' },
];
</script>

<template>
  <nav
    :class="
      cn(
        'fixed top-0 right-0 left-0 z-50',
        isDark ? 'glass border-b border-white/5' : 'sticky border-b border-gray-200 bg-white',
      )
    "
  >
    <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 md:h-16">
      <RouterLink to="/" class="group flex cursor-pointer items-center gap-2">
        <div class="relative h-6 w-6">
          <img
            src="/image/wds-logo.svg"
            alt="WebDev Studios"
            aria-hidden="true"
            class="object-contain"
          />
        </div>
        <span
          :class="
            cn(
              'hidden text-sm font-semibold tracking-tight lg:inline',
              isDark ? 'text-white' : 'text-black',
            )
          "
        >
          WebDev Studios
        </span>
      </RouterLink>

      <NavigationMenu class="hidden md:flex" :viewport="false">
        <NavigationMenuList class="gap-2">
          <!-- Main navigation items -->
          <NavigationMenuItem v-for="item in navItems" :key="item.href">
            <NavigationMenuLink
              as-child
              :class="
                cn(
                  navigationMenuTriggerStyle(),
                  'h-8 text-xs font-medium',
                  isDark
                    ? route.path === item.href
                      ? 'text-wds-accent hover:bg-white/5 hover:text-white!'
                      : 'hover:text-wds-accent! text-white/70'
                    : cn(
                        'bg-transparent',
                        route.path === item.href
                          ? 'border-wds-accent rounded-none border-b-2 pb-1 text-black'
                          : 'text-gray-600 hover:text-black',
                      ),
                )
              "
            >
              <RouterLink :to="item.href">{{ item.label }}</RouterLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div class="flex items-center gap-4">
        <UserAvatar v-if="mounted && user" :variant="isDark ? 'dark' : 'light'" />
        <RouterLink
          v-else
          to="/auth/login"
          :class="
            cn(
              'hidden rounded-lg px-4 py-2 text-xs font-medium transition-colors sm:block',
              isDark
                ? 'hover:text-wds-accent text-white/70 hover:bg-white/5'
                : 'bg-wds-accent hover:bg-wds-accent/90 text-black',
            )
          "
        >
          Đăng nhập
        </RouterLink>

        <!-- Mobile Menu Button -->
        <button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          :class="
            cn(
              'flex h-10 w-10 items-center justify-center rounded-lg transition-colors md:hidden',
              isDark
                ? 'text-white/70 hover:bg-white/5 hover:text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-black',
            )
          "
          aria-label="Toggle menu"
        >
          <X v-if="isMobileMenuOpen" class="h-6 w-6" />
          <Menu v-else class="h-6 w-6" />
        </button>
      </div>
    </div>

    <!-- Mobile Sidebar -->
    <template v-if="isMobileMenuOpen">
      <!-- Backdrop -->
      <div class="fixed inset-0 z-9998 bg-black/50 md:hidden" @click="isMobileMenuOpen = false" />

      <!-- Sidebar -->
      <div
        :class="
          cn(
            'fixed top-0 right-0 z-9999 h-full w-80 max-w-[85vw] overflow-y-auto shadow-2xl md:hidden',
            isDark
              ? 'glass border-l border-white/10 bg-black/98 backdrop-blur-xl'
              : 'border-l border-gray-200 bg-white',
          )
        "
      >
        <div class="flex flex-col p-6">
          <!-- Mobile Logo -->
          <div class="mb-8 flex items-center gap-2">
            <div class="relative h-10 w-10">
              <img src="/image/wds-logo.svg" alt="WebDev Studios" class="object-contain" />
            </div>
            <span
              :class="
                cn('text-sm font-semibold tracking-tight', isDark ? 'text-white' : 'text-black')
              "
            >
              WebDev Studios
            </span>
          </div>

          <!-- Navigation Items -->
          <nav class="flex flex-col gap-2">
            <RouterLink
              v-for="item in navItems"
              :key="item.href"
              :to="item.href"
              @click="isMobileMenuOpen = false"
              :class="
                cn(
                  'flex items-center rounded-lg px-4 py-3 text-base font-medium transition-colors',
                  route.path === item.href
                    ? isDark
                      ? 'text-wds-accent bg-white/10'
                      : 'bg-wds-accent/10 text-wds-accent'
                    : isDark
                      ? 'text-white/70 hover:bg-white/5 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-black',
                )
              "
            >
              {{ item.label }}
            </RouterLink>
          </nav>

          <!-- Mobile Actions -->
          <div class="mt-8 flex flex-col gap-3">
            <div v-if="mounted && user" class="flex justify-center">
              <UserAvatar :variant="isDark ? 'dark' : 'light'" />
            </div>
            <RouterLink
              v-else
              to="/auth/login"
              @click="isMobileMenuOpen = false"
              :class="
                cn(
                  'flex w-full items-center justify-center rounded-lg px-4 py-3 text-base font-medium transition-colors',
                  'bg-wds-accent hover:bg-wds-accent/90 text-black',
                )
              "
            >
              Đăng nhập
            </RouterLink>
          </div>
        </div>
      </div>
    </template>
  </nav>
</template>

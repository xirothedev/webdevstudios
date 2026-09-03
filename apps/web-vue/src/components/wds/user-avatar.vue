<script setup lang="ts">
import { LogOut, Settings, ShoppingBag, User } from 'lucide-vue-next';
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.vue';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.vue';
import { useCurrentUser, useLogout } from '@/lib/api/hooks/use-auth';
import { cn } from 'cn';
import { getAvatarInitials } from '@/lib/utils/avatar';

const props = withDefaults(defineProps<{ variant?: 'dark' | 'light' }>(), { variant: 'light' });

const { data: user, isLoading } = useCurrentUser();
const logout = useLogout();
const isDark = computed(() => props.variant === 'dark');
const initials = computed(() =>
  user.value ? getAvatarInitials(user.value.fullName, user.value.email) : '',
);

const handleLogout = () => {
  logout.mutate('');
};
</script>

<template>
  <DropdownMenu v-if="!isLoading && user">
    <DropdownMenuTrigger as-child>
      <button
        :class="
          cn(
            'focus:ring-wds-accent relative flex cursor-pointer items-center gap-2 rounded-full transition-all outline-none focus:ring-2 focus:ring-offset-2',
            isDark
              ? 'hover:bg-white/5 focus:ring-offset-black'
              : 'hover:bg-gray-100 focus:ring-offset-white',
          )
        "
        aria-label="User menu"
      >
        <Avatar class="h-8 w-8">
          <AvatarImage :src="user.avatar || undefined" :alt="user.fullName || user.email" />
          <AvatarFallback
            :class="
              cn(
                'text-xs font-medium',
                isDark ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-700',
              )
            "
          >
            {{ initials }}
          </AvatarFallback>
        </Avatar>
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      :class="
        cn(
          'w-64 p-2',
          isDark ? 'border-white/10 bg-black/98 backdrop-blur-xl' : 'border-gray-200 bg-white',
        )
      "
    >
      <!-- User Info Section -->
      <div
        :class="
          cn('flex items-center gap-3 rounded-lg px-3 py-3', isDark ? 'bg-white/5' : 'bg-gray-50')
        "
      >
        <Avatar class="h-12 w-12">
          <AvatarImage :src="user.avatar || undefined" :alt="user.fullName || user.email" />
          <AvatarFallback
            :class="
              cn(
                'text-sm font-semibold',
                isDark ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-700',
              )
            "
          >
            {{ initials }}
          </AvatarFallback>
        </Avatar>
        <div class="min-w-0 flex-1">
          <p :class="cn('truncate text-sm font-semibold', isDark ? 'text-white' : 'text-gray-900')">
            {{ user.fullName || 'User' }}
          </p>
          <p :class="cn('truncate text-xs', isDark ? 'text-white/60' : 'text-gray-500')">
            {{ user.email }}
          </p>
        </div>
      </div>

      <DropdownMenuSeparator :class="isDark ? 'bg-white/10' : ''" />

      <!-- Menu Items -->
      <div class="py-1">
        <DropdownMenuItem
          as-child
          :class="
            cn(
              'cursor-pointer rounded-md px-4 py-3',
              isDark
                ? 'text-white/80 focus:bg-white/10 focus:text-white'
                : 'text-gray-700 focus:bg-gray-100 focus:text-gray-900',
            )
          "
        >
          <RouterLink to="/account/profile" class="flex items-center gap-3">
            <User class="h-5 w-5 shrink-0" />
            <span class="text-sm font-medium">Hồ sơ</span>
          </RouterLink>
        </DropdownMenuItem>

        <DropdownMenuItem
          as-child
          :class="
            cn(
              'cursor-pointer rounded-md px-4 py-3',
              isDark
                ? 'text-white/80 focus:bg-white/10 focus:text-white'
                : 'text-gray-700 focus:bg-gray-100 focus:text-gray-900',
            )
          "
        >
          <RouterLink to="/orders" class="flex items-center gap-3">
            <ShoppingBag class="h-5 w-5 shrink-0" />
            <span class="text-sm font-medium">Đơn hàng</span>
          </RouterLink>
        </DropdownMenuItem>

        <DropdownMenuItem
          as-child
          :class="
            cn(
              'cursor-pointer rounded-md px-4 py-3',
              isDark
                ? 'text-white/80 focus:bg-white/10 focus:text-white'
                : 'text-gray-700 focus:bg-gray-100 focus:text-gray-900',
            )
          "
        >
          <RouterLink to="/account/settings" class="flex items-center gap-3">
            <Settings class="h-5 w-5 shrink-0" />
            <span class="text-sm font-medium">Cài đặt</span>
          </RouterLink>
        </DropdownMenuItem>
      </div>

      <DropdownMenuSeparator :class="isDark ? 'bg-white/10' : ''" />

      <!-- Logout -->
      <DropdownMenuItem
        :class="
          cn(
            'cursor-pointer rounded-md px-4 py-3',
            isDark
              ? 'text-red-400 focus:bg-red-500/10 focus:text-red-300'
              : 'text-red-600 focus:bg-red-50 focus:text-red-700',
          )
        "
        @select="handleLogout"
      >
        <div class="flex items-center gap-3">
          <LogOut class="h-5 w-5 shrink-0" />
          <span class="text-sm font-medium">Đăng xuất</span>
        </div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

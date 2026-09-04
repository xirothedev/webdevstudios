<script setup lang="ts">
import {
  BookOpen,
  ChartColumn,
  LogOut,
  Package,
  ShoppingCart,
  Users,
  Wallet,
} from 'lucide-vue-next';
import { useRoute } from 'vue-router';

import { cn } from 'cn';
import { useLogout } from '@/lib/api/hooks/use-auth';

// mirrors apps/web AdminSidebar (BarChart3 → ChartColumn: lucide renamed the icon)
const navigation = [
  { name: 'Dashboard', href: '/admin', icon: ChartColumn },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Transactions', href: '/admin/transactions', icon: Wallet },
  { name: 'Blog', href: '/admin/blog', icon: BookOpen },
];

const route = useRoute();
const logout = useLogout();
</script>

<template>
  <div class="border-wds-accent/20 bg-wds-background flex h-screen w-64 shrink-0 flex-col border-r">
    <div class="border-wds-accent/20 flex h-16 items-center border-b px-6">
      <h1 class="text-wds-text text-xl font-bold">Admin Panel</h1>
    </div>
    <nav class="flex-1 space-y-1 px-3 py-4">
      <RouterLink
        v-for="item in navigation"
        :key="item.name"
        :to="item.href"
        :class="
          cn(
            'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            route.path === item.href
              ? 'bg-wds-accent text-black'
              : 'text-wds-text/70 hover:bg-wds-accent/10 hover:text-wds-text',
          )
        "
      >
        <component :is="item.icon" class="h-5 w-5" />
        {{ item.name }}
      </RouterLink>
    </nav>
    <div class="border-wds-accent/20 border-t p-4">
      <button
        class="group text-wds-text/70 hover:bg-wds-accent/10 hover:text-wds-text flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        @click="logout.mutate()"
      >
        <LogOut class="h-5 w-5" />
        Đăng xuất
      </button>
    </div>
  </div>
</template>

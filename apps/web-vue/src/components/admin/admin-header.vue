<script setup lang="ts">
import { computed } from 'vue';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.vue';
import { useCurrentUser } from '@/lib/api/hooks/use-auth';

defineProps<{ title: string; description?: string }>();

const { data: user } = useCurrentUser();

const initials = computed(() => {
  const u = user.value;
  if (!u) return '';
  return u.fullName
    ? u.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : u.email[0].toUpperCase();
});
</script>

<template>
  <div
    class="border-wds-accent/20 bg-wds-background flex items-center justify-between border-b px-6 py-4"
  >
    <div>
      <h1 class="text-wds-text text-2xl font-bold">{{ title }}</h1>
      <p v-if="description" class="text-wds-text/70 mt-1 text-sm">{{ description }}</p>
    </div>
    <div class="flex items-center gap-4">
      <slot name="actions" />
      <div v-if="user" class="flex items-center gap-3">
        <div class="text-right">
          <p class="text-wds-text text-sm font-medium">{{ user.fullName || user.email }}</p>
          <p class="text-wds-text/70 text-xs">Admin</p>
        </div>
        <Avatar>
          <AvatarImage :src="user.avatar || undefined" :alt="user.fullName || user.email" />
          <AvatarFallback class="bg-wds-accent text-black">{{ initials }}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  </div>
</template>

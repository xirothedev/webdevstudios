<script setup lang="ts">
import { RouterLink } from 'vue-router';

import type { BlogPost } from '@/lib/api/blog';

defineProps<{ post: BlogPost }>();

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
</script>

<template>
  <RouterLink
    :to="`/blog/${post.slug}`"
    class="group border-wds-accent/30 bg-wds-background hover:border-wds-accent/50 flex h-full flex-col overflow-hidden rounded-lg border transition-all hover:shadow-lg"
  >
    <div v-if="post.coverImage" class="relative h-48 w-full overflow-hidden">
      <img
        :src="post.coverImage"
        :alt="post.title"
        loading="lazy"
        class="h-full w-full object-cover transition-transform group-hover:scale-105"
      />
    </div>

    <div class="flex h-full flex-col p-6">
      <div class="flex-1">
        <h2
          class="text-wds-text group-hover:text-wds-accent mb-2 text-xl font-semibold transition-colors"
        >
          {{ post.title }}
        </h2>

        <p v-if="post.excerpt" class="text-wds-text/70 mb-4 line-clamp-3 text-sm">
          {{ post.excerpt }}
        </p>
      </div>

      <div class="text-wds-text/50 mt-auto flex items-center justify-between text-xs">
        <span>{{ post.author.fullName || 'Anonymous' }}</span>
        <span v-if="post.publishedAt">{{ shortDate(post.publishedAt) }}</span>
      </div>
    </div>
  </RouterLink>
</template>

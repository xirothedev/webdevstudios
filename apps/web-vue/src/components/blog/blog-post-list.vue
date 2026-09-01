<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import type { BlogPost } from '@/lib/api/blog';

import BlogPostCard from './blog-post-card.vue';

const props = defineProps<{
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
}>();

const totalPages = computed(() => Math.ceil(props.total / props.pageSize));
</script>

<template>
  <div v-if="posts.length === 0" class="py-12 text-center">
    <p class="text-wds-text/70">Chưa có bài viết nào.</p>
  </div>

  <div v-else>
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <BlogPostCard v-for="post in posts" :key="post.id" :post="post" />
    </div>

    <div v-if="totalPages > 1" class="mt-12 flex justify-center gap-2">
      <RouterLink
        v-if="page > 1"
        :to="`/blog?page=${page - 1}`"
        class="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10 rounded-lg border px-4 py-2 transition-colors"
      >
        Trước
      </RouterLink>

      <RouterLink
        v-for="p in totalPages"
        :key="p"
        :to="`/blog?page=${p}`"
        class="rounded-lg border px-4 py-2 transition-colors"
        :class="
          p === page
            ? 'border-wds-accent bg-wds-accent/20 text-wds-accent'
            : 'border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10'
        "
      >
        {{ p }}
      </RouterLink>

      <RouterLink
        v-if="page < totalPages"
        :to="`/blog?page=${page + 1}`"
        class="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10 rounded-lg border px-4 py-2 transition-colors"
      >
        Sau
      </RouterLink>
    </div>
  </div>
</template>

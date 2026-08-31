<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import BlogPostList from '@/components/blog/blog-post-list.vue';
import { useBlogPosts } from '@/components/blog/use-blog';
import { usePageMeta } from '@/lib/metadata';

usePageMeta({
  title: 'Blog',
  description:
    'Khám phá các bài viết về công nghệ, phát triển web và nhiều chủ đề thú vị khác từ WebDev Studios',
  path: '/blog',
});

const route = useRoute();
const page = computed(() => {
  const n = Number(route.query.page);
  return Number.isFinite(n) && n > 0 ? n : 1;
});

const q = computed(() =>
  typeof route.query.q === 'string' && route.query.q ? route.query.q : undefined,
);

const { data, isError } = useBlogPosts(page, q);
</script>

<template>
  <div class="bg-wds-background min-h-screen">
    <div class="container mx-auto px-4 py-16 pt-24">
      <div class="mb-12 text-center">
        <h1 class="text-wds-text mb-4 text-4xl font-bold">Blog</h1>
        <p class="text-wds-text/70 text-lg">Khám phá các bài viết về công nghệ và phát triển web</p>
      </div>

      <p v-if="isError" class="text-wds-text/70 py-12 text-center">
        Không tải được bài viết. Thử lại sau.
      </p>
      <BlogPostList
        v-else-if="data"
        :posts="data.posts"
        :total="data.total"
        :page="data.page"
        :page-size="data.pageSize"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
import { computed } from 'vue';
import { useHead } from '@unhead/vue';
import { RouterLink, useRoute } from 'vue-router';

import Button from '@/components/ui/button.vue';
import BlogPostContent from '@/components/blog/blog-post-content.vue';
import { useBlogPost } from '@/lib/api/hooks/use-blog';
import { formatDateLong } from '@/lib/date';

const route = useRoute();
const slug = computed(() => String(route.params.slug));
const { data: post } = useBlogPost(slug);

// mirror of apps/web generateMetadata for /blog/[slug] (title/description/OG image, no JSON-LD)
useHead(
  computed(() => {
    const p = post.value;
    if (!p) return { title: 'Blog Post - WebDev Studios' };
    const title = p.metaTitle || p.title;
    const description = p.metaDescription || p.excerpt || p.title;
    return {
      title,
      meta: [
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        ...(p.coverImage ? [{ property: 'og:image', content: p.coverImage }] : []),
      ],
    };
  }),
);
</script>

<template>
  <div class="bg-wds-background min-h-screen">
    <article
      v-if="post && post.isPublished && 'content' in post"
      class="container mx-auto px-4 py-16 pt-24"
    >
      <div class="mx-auto max-w-4xl">
        <div class="mb-6">
          <Button
            variant="ghost"
            as-child
            class="text-wds-text/70 hover:text-wds-text hover:bg-white/5"
          >
            <RouterLink to="/blog" class="flex items-center gap-2">
              <ArrowLeft class="h-4 w-4" />
              <span>Quay về blog</span>
            </RouterLink>
          </Button>
        </div>

        <div
          v-if="post.coverImage"
          class="relative mb-8 h-64 w-full overflow-hidden rounded-lg md:h-96"
        >
          <img :src="post.coverImage" :alt="post.title" class="h-full w-full object-cover" />
        </div>

        <header class="mb-8">
          <h1 class="text-wds-text mb-4 text-4xl font-bold md:text-5xl">{{ post.title }}</h1>

          <div class="text-wds-text/70 flex flex-wrap items-center gap-4 text-sm">
            <span>{{ post.author.fullName || 'Anonymous' }}</span>
            <span v-if="post.publishedAt">{{ formatDateLong(post.publishedAt) }}</span>
            <span>{{ post.viewCount }} lượt xem</span>
          </div>
        </header>

        <BlogPostContent :content="post.content" />
      </div>
    </article>

    <div v-else class="container mx-auto px-4 py-16 pt-24 text-center">
      <h1 class="text-wds-text mb-4 text-4xl font-bold">Bài viết không tồn tại</h1>
      <RouterLink to="/blog" class="text-wds-accent underline">Quay về blog</RouterLink>
    </div>
  </div>
</template>

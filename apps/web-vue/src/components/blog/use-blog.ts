// ponytail: T3 shared hooks dir has no blog.ts and src/lib/** is off-limits to this slice —
// blog vue-query hooks live here until a shared file exists. Same shape as src/lib/api/hooks/*.
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';

import { blogApi, type BlogPostListResponse, type BlogPostWithContent } from '@/lib/api/blog';

export const blogKeys = {
  all: ['blog'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  list: (page: number, pageSize: number, q?: string) =>
    [...blogKeys.lists(), q, page, pageSize] as const,
  details: () => [...blogKeys.all, 'detail'] as const,
  detail: (slug: string) => [...blogKeys.details(), slug] as const,
};

// mirrors apps/web /blog page.tsx: ?q switches listPosts → searchPosts
export function useBlogPosts(
  page: MaybeRefOrGetter<number>,
  q?: MaybeRefOrGetter<string | undefined>,
  pageSize: MaybeRefOrGetter<number> = 10,
) {
  return useQuery<BlogPostListResponse>({
    queryKey: computed(() =>
      blogKeys.list(toValue(page), toValue(pageSize), toValue(q) || undefined),
    ),
    queryFn: () => {
      const query = toValue(q);
      const options = { page: toValue(page), pageSize: toValue(pageSize) };
      return query ? blogApi.searchPosts(query, options) : blogApi.listPosts(options);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBlogPost(slug: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => blogKeys.detail(toValue(slug))),
    // api returns the content field when includeContent=true (verified in apps/web [slug] page)
    queryFn: () => blogApi.getPostBySlug(toValue(slug), true) as Promise<BlogPostWithContent>,
    staleTime: 5 * 60 * 1000,
  });
}

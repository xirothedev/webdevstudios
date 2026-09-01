<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { Edit, Plus } from 'lucide-vue-next';
import { computed, ref } from 'vue';

import AdminHeader from '@/components/admin/admin-header.vue';
import AdminLayout from '@/components/admin/admin-layout.vue';
import BlogPostCard from '@/components/blog/blog-post-card.vue';
import Button from '@/components/ui/button.vue';
import { blogApi } from '@/lib/api/blog';

const page = ref(1);
const pageSize = 20;

const { data: postsData, isLoading } = useQuery({
  queryKey: computed(() => ['admin', 'blog', 'posts', page.value, pageSize]),
  queryFn: () => blogApi.listAllPosts({ page: page.value, pageSize }),
});
</script>

<template>
  <AdminLayout>
    <div class="p-6">
      <AdminHeader title="Quản lý Blog" description="Quản lý các bài viết blog của WebDev Studios">
        <template #actions>
          <RouterLink to="/admin/blog/new">
            <Button
              class="bg-wds-accent hover:bg-wds-accent/90 text-black shadow-lg transition-all hover:shadow-xl"
            >
              <Plus class="h-4 w-4" />
              Tạo bài viết mới
            </Button>
          </RouterLink>
        </template>
      </AdminHeader>

      <div class="mt-8">
        <div v-if="isLoading" class="py-12 text-center">
          <p class="text-wds-text/70">Đang tải...</p>
        </div>
        <template v-else-if="postsData">
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div v-for="post in postsData.posts" :key="post.id" class="group relative">
              <BlogPostCard :post="post" />
              <RouterLink
                :to="`/admin/blog/${post.id}`"
                class="bg-wds-accent hover:bg-wds-accent/90 absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-black shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                <Edit :size="14" />
                Chỉnh sửa
              </RouterLink>
              <span
                v-if="!post.isPublished"
                class="absolute top-3 left-3 z-10 rounded-lg bg-yellow-500/20 px-2.5 py-1.5 text-xs font-medium text-yellow-400 backdrop-blur-sm"
              >
                Bản nháp
              </span>
            </div>
          </div>

          <div v-if="postsData.total > 0" class="mt-12 flex items-center justify-between">
            <div class="text-wds-text/70 text-sm">
              Hiển thị {{ (page - 1) * pageSize + 1 }} đến
              {{ Math.min(page * pageSize, postsData.total) }} trong tổng số
              {{ postsData.total }} bài viết
            </div>
            <div class="flex gap-2">
              <button
                class="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10 cursor-pointer rounded-lg border px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="page === 1"
                @click="page = Math.max(1, page - 1)"
              >
                Trước
              </button>
              <button
                class="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10 cursor-pointer rounded-lg border px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="page * pageSize >= postsData.total"
                @click="page = page + 1"
              >
                Sau
              </button>
            </div>
          </div>
        </template>
        <div v-else class="py-12 text-center">
          <p class="text-wds-text/70">Không có dữ liệu.</p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import AdminHeader from '@/components/admin/admin-header.vue';
import AdminLayout from '@/components/admin/admin-layout.vue';
import BlogEditor from '@/components/admin/blog-editor.vue';
import { blogApi } from '@/lib/api/blog';

const route = useRoute();
const id = computed(() => route.params.id as string);

const {
  data: post,
  isLoading,
  error,
} = useQuery({
  queryKey: computed(() => ['admin', 'blog', 'post', id.value]),
  queryFn: () => blogApi.getPostById(id.value, true),
  enabled: computed(() => !!id.value),
});
</script>

<template>
  <AdminLayout>
    <div v-if="isLoading" class="p-6">
      <AdminHeader title="Chỉnh sửa Blog" description="Đang tải..." />
      <div class="mt-8 py-12 text-center">
        <p class="text-wds-text/70">Đang tải bài viết...</p>
      </div>
    </div>
    <div v-else-if="error || !post" class="p-6">
      <AdminHeader title="Chỉnh sửa Blog" description="Không tìm thấy bài viết" />
      <div class="mt-8 py-12 text-center">
        <p class="text-wds-text/70">Không tìm thấy bài viết hoặc có lỗi xảy ra.</p>
      </div>
    </div>
    <div v-else class="p-6">
      <AdminHeader title="Chỉnh sửa Blog" :description="`Chỉnh sửa bài viết: ${post.title}`" />

      <div class="mt-8">
        <BlogEditor :post-id="id" />
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminHeader from '@/components/admin/admin-header.vue';
import AdminLayout from '@/components/admin/admin-layout.vue';
import BlogEditor from '@/components/admin/blog-editor.vue';
import { usePageMeta } from '@/lib/metadata';

usePageMeta({
  title: 'Tạo bài viết mới - Admin',
  description: 'Tạo bài viết blog mới',
  path: '/admin/blog/new',
});
</script>

<template>
  <AdminLayout>
    <div class="p-6">
      <AdminHeader
        title="Tạo bài viết mới"
        description="Tạo một bài viết blog mới cho WebDev Studios"
      />

      <div class="mt-8">
        <BlogEditor />
      </div>
    </div>
  </AdminLayout>
</template>

/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { use } from 'react';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { BlogEditor } from '@/components/admin/BlogEditor';
import { blogApi } from '@/lib/api/blog';

export function AdminBlogEditPageClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin', 'blog', 'post', id],
    queryFn: () => blogApi.getPostById(id, true),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <AdminHeader title="Chỉnh sửa Blog" description="Đang tải..." />
        <div className="mt-8 py-12 text-center">
          <p className="text-wds-text/70">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-6">
        <AdminHeader
          title="Chỉnh sửa Blog"
          description="Không tìm thấy bài viết"
        />
        <div className="mt-8 py-12 text-center">
          <p className="text-wds-text/70">
            Không tìm thấy bài viết hoặc có lỗi xảy ra.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <AdminHeader
        title="Chỉnh sửa Blog"
        description={`Chỉnh sửa bài viết: ${post.title}`}
      />

      <div className="mt-8">
        <BlogEditor postId={id} />
      </div>
    </div>
  );
}

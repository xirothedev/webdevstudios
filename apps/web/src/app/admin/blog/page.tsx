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
import { Edit, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { Button } from '@/components/ui/button';
import { blogApi } from '@/lib/api/blog';

export default function AdminBlogPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['admin', 'blog', 'posts', page, pageSize],
    queryFn: () => blogApi.listAllPosts({ page, pageSize }),
  });

  return (
    <div className="p-6">
      <AdminHeader
        title="Quản lý Blog"
        description="Quản lý các bài viết blog của WebDev Studios"
        actions={
          <Link href="/admin/blog/new">
            <Button className="bg-wds-accent hover:bg-wds-accent/90 text-black shadow-lg transition-all hover:shadow-xl">
              <Plus className="h-4 w-4" />
              Tạo bài viết mới
            </Button>
          </Link>
        }
      />

      <div className="mt-8">
        {isLoading ? (
          <div className="py-12 text-center">
            <p className="text-wds-text/70">Đang tải...</p>
          </div>
        ) : postsData ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {postsData.posts.map((post) => (
                <div key={post.id} className="group relative">
                  <BlogPostCard post={post} />
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="bg-wds-accent hover:bg-wds-accent/90 absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-black shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                  >
                    <Edit size={14} />
                    Chỉnh sửa
                  </Link>
                  {!post.isPublished && (
                    <span className="absolute top-3 left-3 z-10 rounded-lg bg-yellow-500/20 px-2.5 py-1.5 text-xs font-medium text-yellow-400 backdrop-blur-sm">
                      Bản nháp
                    </span>
                  )}
                </div>
              ))}
            </div>

            {postsData.total > 0 && (
              <div className="mt-12 flex items-center justify-between">
                <div className="text-wds-text/70 text-sm">
                  Hiển thị {(page - 1) * pageSize + 1} đến{' '}
                  {Math.min(page * pageSize, postsData.total)} trong tổng số{' '}
                  {postsData.total} bài viết
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10 cursor-pointer rounded-lg border px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * pageSize >= postsData.total}
                    className="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10 cursor-pointer rounded-lg border px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-wds-text/70">Không có dữ liệu.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { Plus } from 'lucide-react';
import Link from 'next/link';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { BlogPostList } from '@/components/blog/BlogPostList';
import { Button } from '@/components/ui/button';
import { blogApi } from '@/lib/api/blog';

export const metadata = {
  title: 'Quản lý Blog - Admin',
  description: 'Quản lý các bài viết blog',
};

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = searchParams.page ? Number(searchParams.page) : 1;

  // Get all posts (published and unpublished) for admin
  const postsData = await blogApi.listAllPosts({ page, pageSize: 20 });

  return (
    <div className="p-6">
      <AdminHeader
        title="Quản lý Blog"
        description="Quản lý các bài viết blog của WebDev Studios"
        actions={
          <Link href="/admin/blog/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tạo bài viết mới
            </Button>
          </Link>
        }
      />

      <div className="mt-8">
        <BlogPostList
          posts={postsData.posts}
          total={postsData.total}
          page={postsData.page}
          pageSize={postsData.pageSize}
        />
      </div>
    </div>
  );
}

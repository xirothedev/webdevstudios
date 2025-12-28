import { notFound } from 'next/navigation';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { BlogEditor } from '@/components/admin/BlogEditor';
import { blogApi } from '@/lib/api/blog';

export const metadata = {
  title: 'Chỉnh sửa Blog - Admin',
  description: 'Chỉnh sửa bài viết blog',
};

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const post = await blogApi.getPostById(id, true);

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
  } catch (error) {
    console.error('Error fetching blog post:', error);
    notFound();
  }
}

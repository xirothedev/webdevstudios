import { AdminHeader } from '@/components/admin/AdminHeader';
import { BlogEditor } from '@/components/admin/BlogEditor';

export const metadata = {
  title: 'Tạo bài viết mới - Admin',
  description: 'Tạo bài viết blog mới',
};

export default function AdminBlogNewPage() {
  return (
    <div className="p-6">
      <AdminHeader
        title="Tạo bài viết mới"
        description="Tạo một bài viết blog mới cho WebDev Studios"
      />

      <div className="mt-8">
        <BlogEditor />
      </div>
    </div>
  );
}

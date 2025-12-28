import { AdminBlogEditPageClient } from './AdminBlogEditPageClient';

// Required by cacheComponents - must return at least one result
export async function generateStaticParams() {
  // Return placeholder since admin pages are dynamic
  // but cacheComponents requires at least one param
  return [{ id: 'placeholder' }];
}

export default function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <AdminBlogEditPageClient params={params} />;
}

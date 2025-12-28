import { BlogPostList } from '@/components/blog/BlogPostList';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { blogApi } from '@/lib/api/blog';

export const metadata = {
  title: 'Blog - WebDev Studios',
  description:
    'Khám phá các bài viết về công nghệ, phát triển web và nhiều chủ đề thú vị khác từ WebDev Studios',
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page, q } = await searchParams;
  const pageNumber = page ? Number(page) : 1;
  const query = q;

  let postsData;
  if (query) {
    postsData = await blogApi.searchPosts(query, {
      page: pageNumber,
      pageSize: 10,
    });
  } else {
    postsData = await blogApi.listPosts({ page: pageNumber, pageSize: 10 });
  }

  return (
    <div className="bg-wds-background min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-16 pt-24">
        <div className="mb-12 text-center">
          <h1 className="text-wds-text mb-4 text-4xl font-bold">Blog</h1>
          <p className="text-wds-text/70 text-lg">
            Khám phá các bài viết về công nghệ và phát triển web
          </p>
        </div>

        <BlogPostList
          posts={postsData.posts}
          total={postsData.total}
          page={postsData.page}
          pageSize={postsData.pageSize}
        />
      </div>
      <Footer />
    </div>
  );
}

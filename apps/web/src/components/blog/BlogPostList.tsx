import Link from 'next/link';

import { BlogPost } from '@/lib/api/blog';

import { BlogPostCard } from './BlogPostCard';

interface BlogPostListProps {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
}

export function BlogPostList({
  posts,
  total,
  page,
  pageSize,
}: BlogPostListProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-wds-text/70">Chưa có bài viết nào.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/blog?page=${page - 1}`}
              className="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10 rounded-lg border px-4 py-2 transition-colors"
            >
              Trước
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/blog?page=${p}`}
              className={`rounded-lg border px-4 py-2 transition-colors ${
                p === page
                  ? 'border-wds-accent bg-wds-accent/20 text-wds-accent'
                  : 'border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10'
              }`}
            >
              {p}
            </Link>
          ))}

          {page < totalPages && (
            <Link
              href={`/blog?page=${page + 1}`}
              className="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10 rounded-lg border px-4 py-2 transition-colors"
            >
              Sau
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

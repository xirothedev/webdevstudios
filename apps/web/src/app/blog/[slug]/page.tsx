import Image from 'next/image';
import { notFound } from 'next/navigation';

import { BlogPostContentMDX } from '@/components/blog/BlogPostContentMDX';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { blogApi } from '@/lib/api/blog';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await params;
    const post = await blogApi.getPostBySlug(slug, false);

    return {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || post.title,
      openGraph: {
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt || post.title,
        images: post.coverImage ? [post.coverImage] : [],
      },
    };
  } catch {
    return {
      title: 'Blog Post - WebDev Studios',
    };
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await params;
    const post = await blogApi.getPostBySlug(slug, true);

    if (!post.isPublished) {
      notFound();
    }

    if (!('content' in post)) {
      notFound();
    }

    return (
      <div className="bg-wds-background min-h-screen">
        <Navbar />
        <article className="container mx-auto px-4 py-16 pt-24">
          <div className="mx-auto max-w-4xl">
            {post.coverImage && (
              <div className="relative mb-8 h-64 w-full overflow-hidden rounded-lg md:h-96">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 896px"
                />
              </div>
            )}

            <header className="mb-8">
              <h1 className="text-wds-text mb-4 text-4xl font-bold md:text-5xl">
                {post.title}
              </h1>

              <div className="text-wds-text/70 flex flex-wrap items-center gap-4 text-sm">
                <span>{post.author.fullName || 'Anonymous'}</span>
                {post.publishedAt && (
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                )}
                <span>{post.viewCount} lượt xem</span>
              </div>
            </header>

            <BlogPostContentMDX content={post.content} />
          </div>
        </article>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Error fetching blog post:', error);
    notFound();
  }
}

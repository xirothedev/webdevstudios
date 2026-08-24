import { Prisma } from '@prisma/client';

export const BLOG_POST_SELECT = {
  id: true,
  slug: true,
  title: true,
  contentKey: true,
  contentSize: true,
  excerpt: true,
  coverImage: true,
  isPublished: true,
  publishedAt: true,
  viewCount: true,
  metaTitle: true,
  metaDescription: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, fullName: true, avatar: true } },
} satisfies Prisma.BlogPostSelect;

export type BlogPostRow = Prisma.BlogPostGetPayload<{ select: typeof BLOG_POST_SELECT }>;

export type BlogPostRowWithContent = BlogPostRow & { content: string };

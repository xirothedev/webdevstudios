import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma';

import { BlogPostRow } from '../blog.types';

const BLOG_POST_SELECT = {
  id: true,
  slug: true,
  title: true,
  contentUrl: true,
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

@Injectable()
export class BlogPostRepo {
  constructor(private readonly prisma: PrismaService) {}

  async findBySlug(slug: string): Promise<BlogPostRow | null> {
    return this.prisma.blogPost.findUnique({ where: { slug }, select: BLOG_POST_SELECT });
  }

  async findById(id: string): Promise<BlogPostRow | null> {
    return this.prisma.blogPost.findUnique({ where: { id }, select: BLOG_POST_SELECT });
  }

  async findAll(options?: {
    isPublished?: boolean;
    page?: number;
    pageSize?: number;
    authorId?: string;
  }): Promise<{ posts: BlogPostRow[]; total: number }> {
    const { isPublished, page = 1, pageSize = 10, authorId } = options || {};
    const where: { isPublished?: boolean; authorId?: string } = {};

    if (isPublished !== undefined) where.isPublished = isPublished;
    if (authorId) where.authorId = authorId;

    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        select: BLOG_POST_SELECT,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return { posts, total };
  }

  async search(
    query: string,
    options?: { page?: number; pageSize?: number },
  ): Promise<{ posts: BlogPostRow[]; total: number }> {
    const { page = 1, pageSize = 10 } = options || {};

    // ponytail: insensitive contains, not full-text — swap to Postgres tsvector when search volume demands it
    const where = {
      AND: [
        { isPublished: true },
        {
          OR: [
            { title: { contains: query, mode: 'insensitive' as const } },
            { excerpt: { contains: query, mode: 'insensitive' as const } },
          ],
        },
      ],
    };

    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        select: BLOG_POST_SELECT,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return { posts, total };
  }

  async create(data: {
    slug: string;
    title: string;
    contentUrl: string;
    contentSize: number | null;
    excerpt: string | null;
    coverImage: string | null;
    authorId: string;
    isPublished: boolean;
    publishedAt: Date | null;
    metaTitle: string | null;
    metaDescription: string | null;
  }): Promise<BlogPostRow> {
    return this.prisma.blogPost.create({ data, select: BLOG_POST_SELECT });
  }

  async update(
    id: string,
    data: {
      title?: string;
      contentUrl?: string;
      contentSize?: number | null;
      excerpt?: string | null;
      coverImage?: string | null;
      isPublished?: boolean;
      publishedAt?: Date | null;
      metaTitle?: string | null;
      metaDescription?: string | null;
    },
  ): Promise<BlogPostRow> {
    return this.prisma.blogPost.update({ where: { id }, data, select: BLOG_POST_SELECT });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.blogPost.delete({ where: { id } });
  }

  async incrementViewCount(id: string): Promise<BlogPostRow> {
    return this.prisma.blogPost.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: BLOG_POST_SELECT,
    });
  }
}

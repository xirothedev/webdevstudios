import { BlogPost } from '@generated/prisma';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

import { BlogPostWithRelations } from '../blog.interface';

@Injectable()
export class BlogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBySlug(slug: string): Promise<BlogPostWithRelations | null> {
    return this.prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
        tags: true,
      },
    });
  }

  async findById(id: string): Promise<BlogPostWithRelations | null> {
    return this.prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
        tags: true,
      },
    });
  }

  async findAll(options?: {
    isPublished?: boolean;
    page?: number;
    pageSize?: number;
    authorId?: string;
  }): Promise<{ posts: BlogPostWithRelations[]; total: number }> {
    const { isPublished, page = 1, pageSize = 10, authorId } = options || {};
    const skip = (page - 1) * pageSize;

    const where: {
      isPublished?: boolean;
      authorId?: string;
    } = {};

    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
            },
          },
          tags: true,
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return { posts, total };
  }

  async search(
    query: string,
    options?: {
      page?: number;
      pageSize?: number;
    }
  ): Promise<{ posts: BlogPostWithRelations[]; total: number }> {
    const { page = 1, pageSize = 10 } = options || {};
    const skip = (page - 1) * pageSize;

    // Use case-insensitive contains for search (compatible with all PostgreSQL versions)
    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where: {
          AND: [
            { isPublished: true },
            {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { excerpt: { contains: query, mode: 'insensitive' } },
              ],
            },
          ],
        },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
            },
          },
          tags: true,
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.blogPost.count({
        where: {
          AND: [
            { isPublished: true },
            {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { excerpt: { contains: query, mode: 'insensitive' } },
              ],
            },
          ],
        },
      }),
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
  }): Promise<BlogPost> {
    return this.prisma.blogPost.create({
      data,
    });
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
    }
  ): Promise<BlogPost> {
    return this.prisma.blogPost.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.blogPost.delete({
      where: { id },
    });
  }

  async incrementViewCount(id: string): Promise<BlogPost> {
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }
}

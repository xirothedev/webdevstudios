/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { StorageService } from '@/storage/storage.service';

import { BlogPostWithRelations } from '../../blog.interface';
import { BlogPostDto, BlogPostWithContentDto } from '../../dtos/blog-post.dto';
import { BlogRepository } from '../../infrastructure/blog.repository';
import { GetBlogPostBySlugQuery } from './get-post-by-slug.query';

@QueryHandler(GetBlogPostBySlugQuery)
export class GetBlogPostBySlugHandler implements IQueryHandler<GetBlogPostBySlugQuery> {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly storageService: StorageService
  ) {}

  async execute(
    query: GetBlogPostBySlugQuery
  ): Promise<BlogPostDto | BlogPostWithContentDto> {
    const { slug, includeContent = false } = query;

    const post = await this.blogRepository.findBySlug(slug);
    if (!post) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found`);
    }

    // Only return published posts for non-admin users
    // This check should be done at controller level with guards
    // For now, we'll return the post

    const baseDto = this.mapToDto(post);

    if (includeContent) {
      try {
        // Fetch content from R2
        const content = await this.storageService.getBlogContent(
          post.contentUrl
        );

        return {
          ...baseDto,
          content,
        };
      } catch {
        // If content is not found in R2 (e.g., seed data with placeholder URL),
        // throw a more descriptive error
        throw new NotFoundException(
          `Blog post content not found. The content may not have been uploaded to storage yet.`
        );
      }
    }

    // Increment view count if published
    if (post.isPublished) {
      await this.blogRepository.incrementViewCount(post.id);
    }

    return baseDto;
  }

  private mapToDto(post: BlogPostWithRelations): BlogPostDto {
    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      contentUrl: post.contentUrl,
      contentSize: post.contentSize,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      author: {
        id: post.author.id,
        fullName: post.author.fullName,
        avatar: post.author.avatar,
      },
      isPublished: post.isPublished,
      publishedAt: post.publishedAt,
      viewCount: post.viewCount,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
}

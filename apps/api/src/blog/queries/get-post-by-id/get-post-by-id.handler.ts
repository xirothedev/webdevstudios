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
import { GetBlogPostByIdQuery } from './get-post-by-id.query';

@QueryHandler(GetBlogPostByIdQuery)
export class GetBlogPostByIdHandler implements IQueryHandler<GetBlogPostByIdQuery> {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly storageService: StorageService
  ) {}

  async execute(
    query: GetBlogPostByIdQuery
  ): Promise<BlogPostDto | BlogPostWithContentDto> {
    const { postId, includeContent = false } = query;

    const post = await this.blogRepository.findById(postId);
    if (!post) {
      throw new NotFoundException(`Blog post with id ${postId} not found`);
    }

    const baseDto = this.mapToDto(post);

    if (includeContent) {
      // Fetch content from R2
      const content = await this.storageService.getBlogContent(post.contentUrl);

      return {
        ...baseDto,
        content,
      };
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

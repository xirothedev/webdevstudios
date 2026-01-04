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

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { BlogPostWithRelations } from '../../blog.interface';
import { BlogPostDto, BlogPostListResponseDto } from '../../dtos/blog-post.dto';
import { BlogRepository } from '../../infrastructure/blog.repository';
import { SearchBlogPostsQuery } from './search-posts.query';

@QueryHandler(SearchBlogPostsQuery)
export class SearchBlogPostsHandler implements IQueryHandler<SearchBlogPostsQuery> {
  constructor(private readonly blogRepository: BlogRepository) {}

  async execute(query: SearchBlogPostsQuery): Promise<BlogPostListResponseDto> {
    const { query: searchQuery, page = 1, pageSize = 10 } = query;

    const { posts, total } = await this.blogRepository.search(searchQuery, {
      page,
      pageSize,
    });

    return {
      posts: posts.map((post) => this.mapToDto(post)),
      total,
      page,
      pageSize,
    };
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

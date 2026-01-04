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

import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogPostWithRelations } from '../../blog.interface';
import { BlogPostDto } from '../../dtos/blog-post.dto';
import { BlogRepository } from '../../infrastructure/blog.repository';
import { PublishBlogPostCommand } from './publish-post.command';

@CommandHandler(PublishBlogPostCommand)
@Injectable()
export class PublishBlogPostHandler implements ICommandHandler<PublishBlogPostCommand> {
  constructor(private readonly blogRepository: BlogRepository) {}

  async execute(command: PublishBlogPostCommand): Promise<BlogPostDto> {
    const { postId } = command;

    const post = await this.blogRepository.findById(postId);
    if (!post) {
      throw new NotFoundException(`Blog post with id ${postId} not found`);
    }

    await this.blogRepository.update(postId, {
      isPublished: true,
      publishedAt: post.publishedAt || new Date(),
    });

    const updatedPost = await this.blogRepository.findById(postId);
    if (!updatedPost) {
      throw new NotFoundException('Blog post not found after update');
    }

    return this.mapToDto(updatedPost);
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

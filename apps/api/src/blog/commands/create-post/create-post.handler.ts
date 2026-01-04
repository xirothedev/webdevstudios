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

import { ConflictException, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { StorageService } from '@/storage/storage.service';

import { BlogPostWithRelations } from '../../blog.interface';
import { BlogPostDto } from '../../dtos/blog-post.dto';
import { BlogRepository } from '../../infrastructure/blog.repository';
import { CreateBlogPostCommand } from './create-post.command';

@CommandHandler(CreateBlogPostCommand)
@Injectable()
export class CreateBlogPostHandler implements ICommandHandler<CreateBlogPostCommand> {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly storageService: StorageService
  ) {}

  async execute(command: CreateBlogPostCommand): Promise<BlogPostDto> {
    const {
      authorId,
      slug,
      title,
      content,
      excerpt,
      coverImage,
      isPublished,
      metaTitle,
      metaDescription,
    } = command;

    // Check if slug already exists
    const existingPost = await this.blogRepository.findBySlug(slug);
    if (existingPost) {
      throw new ConflictException(
        `Blog post with slug "${slug}" already exists`
      );
    }

    // Upload content to R2 using slug (unique identifier)
    const contentUrl = await this.storageService.uploadBlogContent(
      slug,
      content
    );
    const contentSize = Buffer.from(content, 'utf-8').length;

    // Create post in database
    const post = await this.blogRepository.create({
      slug,
      title,
      contentUrl,
      contentSize,
      excerpt: excerpt || this.extractExcerpt(content),
      coverImage,
      authorId,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      metaTitle,
      metaDescription,
    });

    // If we want to use post ID instead of slug, we can move the file here
    // For now, we'll use slug which is also unique and URL-friendly

    // Fetch full post with relations
    const fullPost = await this.blogRepository.findById(post.id);
    if (!fullPost) {
      throw new Error('Failed to fetch created post');
    }

    return this.mapToDto(fullPost);
  }

  private extractExcerpt(content: string, maxLength = 500): string {
    // Remove markdown syntax for excerpt
    const plainText = content
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();

    if (plainText.length <= maxLength) {
      return plainText;
    }

    return `${plainText.substring(0, maxLength - 3)}...`;
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

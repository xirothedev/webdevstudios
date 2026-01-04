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

import { StorageService } from '@/storage/storage.service';

import { BlogPostWithRelations } from '../../blog.interface';
import { BlogPostDto } from '../../dtos/blog-post.dto';
import { BlogRepository } from '../../infrastructure/blog.repository';
import { UpdateBlogPostCommand } from './update-post.command';

@CommandHandler(UpdateBlogPostCommand)
@Injectable()
export class UpdateBlogPostHandler implements ICommandHandler<UpdateBlogPostCommand> {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly storageService: StorageService
  ) {}

  async execute(command: UpdateBlogPostCommand): Promise<BlogPostDto> {
    const {
      postId,
      title,
      content,
      excerpt,
      coverImage,
      isPublished,
      metaTitle,
      metaDescription,
    } = command;

    const post = await this.blogRepository.findById(postId);
    if (!post) {
      throw new NotFoundException(`Blog post with id ${postId} not found`);
    }

    const updateData: {
      title?: string;
      contentUrl?: string;
      contentSize?: number | null;
      excerpt?: string | null;
      coverImage?: string | null;
      isPublished?: boolean;
      publishedAt?: Date | null;
      metaTitle?: string | null;
      metaDescription?: string | null;
    } = {};

    if (title !== undefined) updateData.title = title;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished;
      // Set publishedAt if publishing for the first time
      if (isPublished && !post.isPublished) {
        updateData.publishedAt = new Date();
      }
    }
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined)
      updateData.metaDescription = metaDescription;

    // Handle content update
    if (content !== undefined) {
      const newContentUrl = await this.storageService.uploadBlogContent(
        postId,
        content
      );
      const contentSize = Buffer.from(content, 'utf-8').length;
      updateData.contentUrl = newContentUrl;
      updateData.contentSize = contentSize;

      // Delete old content file if URL changed
      if (post.contentUrl !== newContentUrl) {
        try {
          await this.storageService.deleteBlogContent(post.contentUrl);
        } catch (error) {
          // Log error but don't fail the update
          console.error('Failed to delete old content file:', error);
        }
      }

      // Update excerpt if content changed
      updateData.excerpt =
        excerpt !== undefined ? excerpt : this.extractExcerpt(content);
    } else if (excerpt !== undefined) {
      updateData.excerpt = excerpt;
    }

    await this.blogRepository.update(postId, updateData);

    const updatedPost = await this.blogRepository.findById(postId);
    if (!updatedPost) {
      throw new NotFoundException('Blog post not found after update');
    }

    return this.mapToDto(updatedPost);
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

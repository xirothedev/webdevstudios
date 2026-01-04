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

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { StorageService } from '@/storage/storage.service';

import { BlogRepository } from '../../infrastructure/blog.repository';
import { DeleteBlogPostCommand } from './delete-post.command';

@CommandHandler(DeleteBlogPostCommand)
@Injectable()
export class DeleteBlogPostHandler implements ICommandHandler<DeleteBlogPostCommand> {
  logger = new Logger(DeleteBlogPostHandler.name);

  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly storageService: StorageService
  ) {}

  async execute(command: DeleteBlogPostCommand): Promise<void> {
    const { postId } = command;

    const post = await this.blogRepository.findById(postId);
    if (!post) {
      throw new NotFoundException(`Blog post with id ${postId} not found`);
    }

    // Delete content from R2
    try {
      await this.storageService.deleteBlogContent(post.contentUrl);
    } catch (error) {
      // Log error but continue with database deletion
      this.logger.error('Failed to delete content file from R2:', error);
    }

    // Delete cover image from R2 if exists
    if (post.coverImage) {
      try {
        const coverImageKey = this.storageService.extractKeyFromUrl(
          post.coverImage
        );
        if (coverImageKey) {
          await this.storageService.deleteFile(coverImageKey);
        }
      } catch (error) {
        // Log error but continue
        this.logger.error('Failed to delete cover image from R2:', error);
      }
    }

    // Delete from database (cascade will handle comments and tags)
    await this.blogRepository.delete(postId);
  }
}

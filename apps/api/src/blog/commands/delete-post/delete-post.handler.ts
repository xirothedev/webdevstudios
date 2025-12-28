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

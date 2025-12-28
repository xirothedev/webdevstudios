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

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

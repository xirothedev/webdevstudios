import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { BlogPostWithRelations } from '../../blog.interface';
import { BlogPostDto, BlogPostListResponseDto } from '../../dtos/blog-post.dto';
import { BlogRepository } from '../../infrastructure/blog.repository';
import { ListBlogPostsQuery } from './list-posts.query';

@QueryHandler(ListBlogPostsQuery)
export class ListBlogPostsHandler implements IQueryHandler<ListBlogPostsQuery> {
  constructor(private readonly blogRepository: BlogRepository) {}

  async execute(query: ListBlogPostsQuery): Promise<BlogPostListResponseDto> {
    const { page = 1, pageSize = 10, isPublished, authorId } = query;

    const { posts, total } = await this.blogRepository.findAll({
      isPublished,
      page,
      pageSize,
      authorId,
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

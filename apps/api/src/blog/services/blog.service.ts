import { ConflictException, Injectable } from '@nestjs/common';
import { StorageService } from '@/storage/storage.service';
import { BlogRepository } from '../infrastructure/blog.repository';
import { BlogPostWithRelations } from '../blog.types';
import { BlogPostDto } from '../dtos';

@Injectable()
export class BlogService {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly storageService: StorageService,
  ) {}

  async createPost(params: {
    authorId: string;
    slug: string;
    title: string;
    content: string;
    excerpt?: string | null;
    coverImage?: string | null;
    isPublished: boolean;
    metaTitle?: string | null;
    metaDescription?: string | null;
  }): Promise<BlogPostDto> {
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
    } = params;

    const existingPost = await this.blogRepository.findBySlug(slug);
    if (existingPost) {
      throw new ConflictException(`Blog post with slug "${slug}" already exists`);
    }

    const contentUrl = await this.storageService.uploadBlogContent(slug, content);
    const contentSize = Buffer.from(content, 'utf-8').length;

    const post = await this.blogRepository.create({
      slug,
      title,
      contentUrl,
      contentSize,
      excerpt: excerpt || this.extractExcerpt(content),
      coverImage: coverImage || null,
      authorId,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
    });

    const fullPost = await this.blogRepository.findById(post.id);
    if (!fullPost) {
      throw new Error('Failed to fetch created post');
    }

    return this.mapToDto(fullPost);
  }

  private extractExcerpt(content: string, maxLength = 500): string {
    const plainText = content
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      .replace(/\n+/g, ' ')
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

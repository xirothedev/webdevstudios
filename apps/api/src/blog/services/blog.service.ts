import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { StorageService } from '@/storage/storage.service';

import { BlogPostRow, BlogPostRowWithContent } from '../blog.types';
import {
  CreateBlogPostDto,
  GetBlogPostQueryDto,
  ListBlogPostsQueryDto,
  SearchBlogPostsQueryDto,
  UpdateBlogPostDto,
} from '../dto';
import { BlogPostRepo } from '../repo';

@Injectable()
export class BlogService {
  constructor(
    private readonly blogRepository: BlogPostRepo,
    private readonly storageService: StorageService,
  ) {}

  async createPost(authorId: string, dto: CreateBlogPostDto): Promise<BlogPostRow> {
    const existingPost = await this.blogRepository.findBySlug(dto.slug);
    if (existingPost) {
      throw new ConflictException(`Blog post with slug "${dto.slug}" already exists`);
    }

    const contentUrl = await this.storageService.uploadBlogContent(dto.slug, dto.content);

    return this.blogRepository.create({
      slug: dto.slug,
      title: dto.title,
      contentUrl,
      contentSize: Buffer.from(dto.content, 'utf-8').length,
      excerpt: dto.excerpt ?? this.extractExcerpt(dto.content),
      coverImage: dto.coverImage ?? null,
      authorId,
      isPublished: dto.isPublished ?? false,
      publishedAt: dto.isPublished ? new Date() : null,
      metaTitle: dto.metaTitle ?? null,
      metaDescription: dto.metaDescription ?? null,
    });
  }

  async updatePost(postId: string, dto: UpdateBlogPostDto): Promise<BlogPostRow> {
    const post = await this.blogRepository.findById(postId);
    if (!post) {
      throw new NotFoundException(`Blog post with id ${postId} not found`);
    }

    const data: {
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

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.coverImage !== undefined) data.coverImage = dto.coverImage;
    if (dto.isPublished !== undefined) {
      data.isPublished = dto.isPublished;
      if (dto.isPublished && !post.isPublished) {
        data.publishedAt = new Date();
      }
    }
    if (dto.metaTitle !== undefined) data.metaTitle = dto.metaTitle;
    if (dto.metaDescription !== undefined) data.metaDescription = dto.metaDescription;

    if (dto.content !== undefined) {
      const contentUrl = await this.storageService.uploadBlogContent(postId, dto.content);
      data.contentSize = Buffer.from(dto.content, 'utf-8').length;

      if (post.contentUrl !== contentUrl) {
        try {
          await this.storageService.deleteBlogContent(post.contentUrl);
        } catch (error) {
          console.error('Failed to delete old content file:', error);
        }
      }

      data.excerpt = dto.excerpt !== undefined ? dto.excerpt : this.extractExcerpt(dto.content);
    } else if (dto.excerpt !== undefined) {
      data.excerpt = dto.excerpt;
    }

    return this.blogRepository.update(postId, data);
  }

  async getPostById(
    id: string,
    query?: GetBlogPostQueryDto,
  ): Promise<BlogPostRow | BlogPostRowWithContent> {
    const post = await this.blogRepository.findById(id);
    if (!post) throw new NotFoundException('Blog post not found');

    if (query?.includeContent) return this.withContent(post);
    return post;
  }

  async getPostBySlug(
    slug: string,
    query?: GetBlogPostQueryDto,
  ): Promise<BlogPostRow | BlogPostRowWithContent> {
    const post = await this.blogRepository.findBySlug(slug);
    if (!post) throw new NotFoundException(`Blog post with slug "${slug}" not found`);

    if (query?.includeContent) return this.withContent(post);

    if (post.isPublished) await this.blogRepository.incrementViewCount(post.id);
    return post;
  }

  private async withContent(post: BlogPostRow): Promise<BlogPostRowWithContent> {
    try {
      const content = await this.storageService.getBlogContent(post.contentUrl);
      return { ...post, content };
    } catch {
      throw new NotFoundException(
        'Blog post content not found. The content may not have been uploaded to storage yet.',
      );
    }
  }

  async deletePost(id: string): Promise<void> {
    const post = await this.blogRepository.findById(id);
    if (!post) throw new NotFoundException('Blog post not found');
    await this.blogRepository.delete(id);
  }

  async publishPost(id: string): Promise<BlogPostRow> {
    const post = await this.blogRepository.findById(id);
    if (!post) throw new NotFoundException('Blog post not found');
    if (post.isPublished) return post;

    return this.blogRepository.update(id, { isPublished: true, publishedAt: new Date() });
  }

  async listPublishedPosts(
    query: ListBlogPostsQueryDto,
  ): Promise<{ items: BlogPostRow[]; total: number }> {
    const { posts, total } = await this.blogRepository.findAll({
      isPublished: true,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
    });
    return { items: posts, total };
  }

  async listAllPosts(
    query: ListBlogPostsQueryDto,
  ): Promise<{ items: BlogPostRow[]; total: number }> {
    const { posts, total } = await this.blogRepository.findAll({
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    });
    return { items: posts, total };
  }

  async searchPosts(
    query: SearchBlogPostsQueryDto,
  ): Promise<{ items: BlogPostRow[]; total: number }> {
    const { posts, total } = await this.blogRepository.search(query.q, {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
    });
    return { items: posts, total };
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
}

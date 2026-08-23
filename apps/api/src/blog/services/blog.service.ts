import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';

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
  private readonly logger = new Logger(BlogService.name);

  constructor(
    private readonly blogRepository: BlogPostRepo,
    private readonly storageService: StorageService,
  ) {}

  async createPost(authorId: string, dto: CreateBlogPostDto): Promise<BlogPostRow> {
    const existingPost = await this.blogRepository.findBySlug(dto.slug);
    if (existingPost) {
      throw new ConflictException(`Blog post with slug "${dto.slug}" already exists`);
    }

    // The content key derives from the post id, so the row must exist before uploading.
    const created = await this.blogRepository.create({
      slug: dto.slug,
      title: dto.title,
      contentKey: '',
      contentSize: Buffer.from(dto.content, 'utf-8').length,
      excerpt: dto.excerpt ?? this.extractExcerpt(dto.content),
      coverImage: dto.coverImage ?? null,
      authorId,
      isPublished: dto.isPublished ?? false,
      publishedAt: dto.isPublished ? new Date() : null,
      metaTitle: dto.metaTitle ?? null,
      metaDescription: dto.metaDescription ?? null,
    });

    try {
      const contentKey = await this.storageService.uploadBlogContent(created.id, dto.content);
      const post = await this.blogRepository.update(created.id, { contentKey });
      return this.toResponse(post);
    } catch (error) {
      // Don't leave a row pointing at content that never uploaded.
      await this.blogRepository.delete(created.id).catch(() => {});
      throw error;
    }
  }

  async updatePost(postId: string, dto: UpdateBlogPostDto): Promise<BlogPostRow> {
    const post = await this.blogRepository.findById(postId);
    if (!post) {
      throw new NotFoundException(`Blog post with id ${postId} not found`);
    }

    const data: {
      title?: string;
      contentKey?: string;
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
      // Same postId-derived key every time, so uploads overwrite in place.
      data.contentKey = await this.storageService.uploadBlogContent(postId, dto.content);
      data.contentSize = Buffer.from(dto.content, 'utf-8').length;
      data.excerpt = dto.excerpt !== undefined ? dto.excerpt : this.extractExcerpt(dto.content);
    } else if (dto.excerpt !== undefined) {
      data.excerpt = dto.excerpt;
    }

    return this.toResponse(await this.blogRepository.update(postId, data));
  }

  async getPostById(
    id: string,
    query?: GetBlogPostQueryDto,
  ): Promise<BlogPostRow | BlogPostRowWithContent> {
    const post = await this.blogRepository.findById(id);
    if (!post) throw new NotFoundException('Blog post not found');

    if (query?.includeContent) return this.withContent(post);
    return this.toResponse(post);
  }

  async getPostBySlug(
    slug: string,
    query?: GetBlogPostQueryDto,
  ): Promise<BlogPostRow | BlogPostRowWithContent> {
    const post = await this.blogRepository.findBySlug(slug);
    if (!post) throw new NotFoundException(`Blog post with slug "${slug}" not found`);

    if (query?.includeContent) return this.withContent(post);

    if (post.isPublished) await this.blogRepository.incrementViewCount(post.id);
    return this.toResponse(post);
  }

  // Rows persist R2 keys; clients get derived URLs.
  private toResponse<T extends BlogPostRow>(post: T): T {
    return {
      ...post,
      coverImage: this.storageService.resolveMediaUrl(post.coverImage),
      author: { ...post.author, avatar: this.storageService.resolveMediaUrl(post.author.avatar) },
    };
  }

  private async withContent(post: BlogPostRow): Promise<BlogPostRowWithContent> {
    try {
      const content = await this.storageService.getBlogContent(post.contentKey);
      return { ...this.toResponse(post), content };
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

    // Fire-and-forget: a failed storage delete must not fail the row delete.
    this.storageService
      .deleteBlogContent(post.contentKey)
      .catch((error) =>
        this.logger.error(`Failed to delete blog content for post ${id}: ${error}`),
      );
  }

  async publishPost(id: string): Promise<BlogPostRow> {
    const post = await this.blogRepository.findById(id);
    if (!post) throw new NotFoundException('Blog post not found');
    if (post.isPublished) return this.toResponse(post);

    return this.toResponse(
      await this.blogRepository.update(id, { isPublished: true, publishedAt: new Date() }),
    );
  }

  async listPublishedPosts(
    query: ListBlogPostsQueryDto,
  ): Promise<{ items: BlogPostRow[]; total: number }> {
    const { posts, total } = await this.blogRepository.findAll({
      isPublished: true,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
    });
    return { items: posts.map((p) => this.toResponse(p)), total };
  }

  async listAllPosts(
    query: ListBlogPostsQueryDto,
  ): Promise<{ items: BlogPostRow[]; total: number }> {
    const { posts, total } = await this.blogRepository.findAll({
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    });
    return { items: posts.map((p) => this.toResponse(p)), total };
  }

  async searchPosts(
    query: SearchBlogPostsQueryDto,
  ): Promise<{ items: BlogPostRow[]; total: number }> {
    const { posts, total } = await this.blogRepository.search(query.q, {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
    });
    return { items: posts.map((p) => this.toResponse(p)), total };
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

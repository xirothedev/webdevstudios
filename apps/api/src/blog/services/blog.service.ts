import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { StorageService } from '@/storage/storage.service';

import { BlogPostWithRelations } from '../blog.types';
import { BlogPostDto } from '../dtos';
import { BlogRepository } from '../infrastructure/blog.repository';

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

  async updatePost(params: {
    postId: string;
    title?: string;
    content?: string;
    excerpt?: string | null;
    coverImage?: string | null;
    isPublished?: boolean;
    metaTitle?: string | null;
    metaDescription?: string | null;
  }): Promise<BlogPostDto> {
    const { postId, title, content, excerpt, coverImage, isPublished, metaTitle, metaDescription } =
      params;

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
      if (isPublished && !post.isPublished) {
        updateData.publishedAt = new Date();
      }
    }
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;

    if (content !== undefined) {
      const newContentUrl = await this.storageService.uploadBlogContent(postId, content);
      const contentSize = Buffer.from(content, 'utf-8').length;
      updateData.contentUrl = newContentUrl;
      updateData.contentSize = contentSize;

      if (post.contentUrl !== newContentUrl) {
        try {
          await this.storageService.deleteBlogContent(post.contentUrl);
        } catch (error) {
          // Log error but don't fail the update
          console.error('Failed to delete old content file:', error);
        }
      }

      updateData.excerpt = excerpt !== undefined ? excerpt : this.extractExcerpt(content);
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

  async listPosts(params: { page?: number; pageSize?: number; publishedOnly?: boolean }) {
    const { posts, total } = await this.blogRepository.findAll({
      isPublished: params.publishedOnly ? true : undefined,
      page: params.page,
      pageSize: params.pageSize,
    });
    return { items: posts.map((p) => this.mapToDto(p)), total };
  }

  async getPostById(id: string) {
    const post = await this.blogRepository.findById(id);
    if (!post) throw new NotFoundException('Blog post not found');
    return this.mapToDto(post);
  }

  async getPostBySlug(slug: string) {
    const post = await this.blogRepository.findBySlug(slug);
    if (!post) throw new NotFoundException('Blog post not found');
    return this.mapToDto(post);
  }

  async deletePost(id: string) {
    const post = await this.blogRepository.findById(id);
    if (!post) throw new NotFoundException('Blog post not found');
    await this.blogRepository.delete(id);
  }

  async publishPost(id: string) {
    const post = await this.blogRepository.findById(id);
    if (!post) throw new NotFoundException('Blog post not found');
    if (post.isPublished) return this.mapToDto(post);
    const updated = await this.blogRepository.update(id, {
      isPublished: true,
      publishedAt: new Date(),
    });
    return this.mapToDto(updated as unknown as BlogPostWithRelations);
  }
}

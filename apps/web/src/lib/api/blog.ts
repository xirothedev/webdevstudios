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

import { apiClient } from '../api-client';

export interface BlogPostAuthor {
  id: string;
  fullName: string | null;
  avatar: string | null;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  contentUrl: string;
  contentSize: number | null;
  excerpt: string | null;
  coverImage: string | null;
  author: BlogPostAuthor;
  isPublished: boolean;
  publishedAt: string | null;
  viewCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostWithContent extends BlogPost {
  content: string;
}

export interface BlogPostListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateBlogPostDto {
  slug: string;
  title: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  isPublished?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface UpdateBlogPostDto {
  title?: string;
  content?: string;
  excerpt?: string | null;
  coverImage?: string | null;
  isPublished?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export const blogApi = {
  /**
   * List blog posts
   */
  async listPosts(options?: {
    page?: number;
    pageSize?: number;
  }): Promise<BlogPostListResponse> {
    const response = await apiClient.get<{ data: BlogPostListResponse }>(
      '/blog/posts',
      {
        params: options,
      }
    );
    return response.data.data;
  },

  /**
   * List all blog posts (Admin only - includes unpublished)
   */
  async listAllPosts(options?: {
    page?: number;
    pageSize?: number;
  }): Promise<BlogPostListResponse> {
    const response = await apiClient.get<{ data: BlogPostListResponse }>(
      '/blog/posts/admin/all',
      {
        params: options,
      }
    );
    return response.data.data;
  },

  /**
   * Search blog posts
   */
  async searchPosts(
    query: string,
    options?: {
      page?: number;
      pageSize?: number;
    }
  ): Promise<BlogPostListResponse> {
    const response = await apiClient.get<{ data: BlogPostListResponse }>(
      '/blog/posts/search',
      {
        params: {
          q: query,
          ...options,
        },
      }
    );
    return response.data.data;
  },

  /**
   * Get blog post by slug
   */
  async getPostBySlug(
    slug: string,
    includeContent = false
  ): Promise<BlogPost | BlogPostWithContent> {
    const response = await apiClient.get<{
      data: BlogPost | BlogPostWithContent;
    }>(`/blog/posts/${slug}`, {
      params: {
        includeContent,
      },
    });
    return response.data.data;
  },

  /**
   * Get blog post by ID (Admin only)
   */
  async getPostById(
    id: string,
    includeContent = true
  ): Promise<BlogPost | BlogPostWithContent> {
    const response = await apiClient.get<{
      data: BlogPost | BlogPostWithContent;
    }>(`/blog/posts/admin/${id}`, {
      params: {
        includeContent,
      },
    });
    return response.data.data;
  },

  /**
   * Create blog post (Admin only)
   */
  async createPost(dto: CreateBlogPostDto): Promise<BlogPost> {
    const response = await apiClient.post<{ data: BlogPost }>(
      '/blog/posts',
      dto
    );
    return response.data.data;
  },

  /**
   * Update blog post (Admin only)
   */
  async updatePost(id: string, dto: UpdateBlogPostDto): Promise<BlogPost> {
    const response = await apiClient.patch<{ data: BlogPost }>(
      `/blog/posts/${id}`,
      dto
    );
    return response.data.data;
  },

  /**
   * Delete blog post (Admin only)
   */
  async deletePost(id: string): Promise<void> {
    await apiClient.delete(`/blog/posts/${id}`);
  },

  /**
   * Publish blog post (Admin only)
   */
  async publishPost(id: string): Promise<BlogPost> {
    const response = await apiClient.post<{ data: BlogPost }>(
      `/blog/posts/${id}/publish`
    );
    return response.data.data;
  },
};

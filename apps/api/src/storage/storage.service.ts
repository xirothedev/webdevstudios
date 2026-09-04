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

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

import { StorageException } from './exceptions';
import { StorageConfig } from './storage.config';
import { processImage, validateImage } from './utils/image-optimization.util';

export type CacheStrategy = 'immutable' | 'long-lived' | 'short-lived' | 'no-cache';

export interface CacheOptions {
  /**
   * Cache strategy:
   * - 'immutable': Files never change (1 year cache, immutable)
   * - 'long-lived': Files rarely change (30 days cache)
   * - 'short-lived': Files may change (1 day cache)
   * - 'no-cache': Don't cache
   */
  strategy?: CacheStrategy;
  /**
   * Custom max-age in seconds (overrides strategy default)
   */
  maxAge?: number;
}

export interface UploadFileOptions {
  key: string;
  file: Buffer;
  contentType: string;
  metadata?: Record<string, string>;
  cache?: CacheOptions;
}

export interface UploadImageOptions {
  key: string;
  file: Buffer;
  contentType: string;
  width?: number;
  height?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
}

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;

  constructor(private readonly config: StorageConfig) {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: this.config.endpoint,
      forcePathStyle: this.config.forcePathStyle,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
  }

  /**
   * Get cache control header based on strategy
   */
  private getCacheControl(cache?: CacheOptions): string {
    if (!cache || cache.strategy === 'no-cache') {
      return 'no-cache, no-store, must-revalidate';
    }

    const maxAge = cache.maxAge ?? this.getDefaultMaxAge(cache.strategy);
    const strategy = cache.strategy || 'long-lived';

    if (strategy === 'immutable') {
      return `public, max-age=${maxAge}, immutable`;
    }

    return `public, max-age=${maxAge}`;
  }

  /**
   * Get default max-age for cache strategy
   */
  private getDefaultMaxAge(strategy: CacheStrategy | undefined): number {
    if (!strategy) {
      return 2592000; // 30 days default
    }

    switch (strategy) {
      case 'immutable':
        return 31536000; // 1 year
      case 'long-lived':
        return 2592000; // 30 days
      case 'short-lived':
        return 86400; // 1 day
      case 'no-cache':
        return 0;
      default:
        return 2592000; // 30 days default
    }
  }

  /**
   * Upload file to R2
   */
  async uploadFile(options: UploadFileOptions): Promise<UploadResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: options.key,
        Body: options.file,
        ContentType: options.contentType,
        CacheControl: this.getCacheControl(options.cache),
        Metadata: options.metadata,
      });

      await this.s3Client.send(command);

      const url = this.getFileUrl(options.key);

      return {
        key: options.key,
        url,
        size: options.file.length,
      };
    } catch (error) {
      throw new StorageException(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Upload image with optimization
   */
  async uploadImage(options: UploadImageOptions): Promise<UploadResult> {
    try {
      // Validate image
      await validateImage(options.file);

      // Process image (resize and convert to WebP)
      const processedImage = await processImage(options.file, {
        width: options.width || 400,
        height: options.height || 400,
        fit: 'cover',
      });

      // Upload processed image with immutable cache (avatar files have unique timestamp + UUID)
      return await this.uploadFile({
        key: options.key,
        file: processedImage,
        contentType: 'image/webp',
        cache: { strategy: 'immutable' },
      });
    } catch (error) {
      if (error instanceof StorageException) {
        throw error;
      }
      throw new StorageException(
        `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Delete file from R2
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new StorageException(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get public URL for file
   */
  getFileUrl(key: string): string {
    const baseUrl = this.config.publicUrl.endsWith('/')
      ? this.config.publicUrl.slice(0, -1)
      : this.config.publicUrl;
    return `${baseUrl}/${key}`;
  }

  /**
   * Resolve a stored media reference to a public URL.
   * Rows persist R2 keys; absolute URLs (e.g. OAuth provider pictures) pass through untouched.
   */
  resolveMediaUrl(ref: string | null | undefined): string | null {
    if (!ref) return null;
    return ref.includes('://') ? ref : this.getFileUrl(ref);
  }

  /**
   * Upload blog content (markdown) to R2
   * @param postId Blog post ID
   * @param content Markdown content
   * @returns The R2 object key of the uploaded content
   */
  async uploadBlogContent(postId: string, content: string): Promise<string> {
    const key = `blog/posts/${postId}/content.md`;
    const contentBuffer = Buffer.from(content, 'utf-8');

    await this.uploadFile({
      key,
      file: contentBuffer,
      contentType: 'text/markdown',
      cache: { strategy: 'long-lived' }, // Cache for 30 days
    });

    return key;
  }

  /**
   * Get blog content from R2
   * @param contentKey R2 object key of the content file
   * @returns Markdown content as string
   */
  async getBlogContent(contentKey: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucketName,
        Key: contentKey,
      });

      const response = await this.s3Client.send(command);
      if (!response.Body) {
        throw new StorageException('Content not found');
      }

      // Convert stream to string
      // AWS SDK v3 returns Body as Readable (Node.js stream) which is async iterable
      const chunks: Uint8Array[] = [];
      const body = response.Body as AsyncIterable<Uint8Array> | undefined;

      if (!body) {
        throw new StorageException('Content not found');
      }

      // Read the stream as async iterable
      for await (const chunk of body) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      return buffer.toString('utf-8');
    } catch (error) {
      if (error instanceof StorageException) {
        throw error;
      }
      throw new StorageException(
        `Failed to get blog content: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Delete blog content from R2
   * @param contentKey R2 object key of the content file
   */
  async deleteBlogContent(contentKey: string): Promise<void> {
    await this.deleteFile(contentKey);
  }

  /**
   * Upload blog cover image to R2
   * @param postId Blog post ID
   * @param file Image file buffer
   * @returns The R2 object key of the uploaded image
   */
  async uploadBlogCoverImage(postId: string, file: Buffer): Promise<string> {
    const key = `blog/images/covers/${postId}-cover.webp`;

    await this.uploadImage({
      key,
      file,
      contentType: 'image/webp', // Will be converted to WebP by processImage
      width: 1200, // Cover image width
      height: 630, // Cover image height (Open Graph recommended size)
    });

    return key;
  }
}

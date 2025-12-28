import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

import { StorageException } from './exceptions/storage.exception';
import {
  CacheOptions,
  CacheStrategy,
  UploadFileOptions,
  UploadImageOptions,
  UploadResult,
} from './interfaces/storage.interface';
import { StorageConfig } from './storage.config';
import { processImage, validateImage } from './utils/image-optimization.util';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;

  constructor(private readonly config: StorageConfig) {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: this.config.endpoint,
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
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
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
        `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`
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
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`
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
   * Extract key from R2 URL
   * Handles both full R2 URLs and relative paths
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      const baseUrl = this.config.publicUrl.endsWith('/')
        ? this.config.publicUrl.slice(0, -1)
        : this.config.publicUrl;

      // If URL is a full R2 URL, extract the key
      if (url.startsWith(baseUrl)) {
        return url.replace(`${baseUrl}/`, '');
      }

      // If URL is a relative path (e.g., "blog/posts/slug/content.md"),
      // treat it as a key directly
      // Normalize: remove leading slash if present
      const normalizedKey = url.startsWith('/') ? url.slice(1) : url;

      // Validate: key should not be empty and should not contain "://" (to avoid treating full URLs as keys)
      if (normalizedKey && !normalizedKey.includes('://')) {
        return normalizedKey;
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Upload blog content (markdown) to R2
   * @param identifier Blog post ID or slug (unique identifier)
   * @param content Markdown content
   * @returns R2 URL to the uploaded content
   */
  async uploadBlogContent(
    identifier: string,
    content: string
  ): Promise<string> {
    const key = `blog/posts/${identifier}/content.md`;
    const contentBuffer = Buffer.from(content, 'utf-8');

    const result = await this.uploadFile({
      key,
      file: contentBuffer,
      contentType: 'text/markdown',
      cache: { strategy: 'long-lived' }, // Cache for 30 days
    });

    return result.url;
  }

  /**
   * Get blog content from R2
   * @param contentUrl R2 URL to the content file
   * @returns Markdown content as string
   */
  async getBlogContent(contentUrl: string): Promise<string> {
    try {
      const key = this.extractKeyFromUrl(contentUrl);
      if (!key) {
        throw new StorageException('Invalid content URL');
      }

      const command = new GetObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
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
        `Failed to get blog content: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete blog content from R2
   * @param contentUrl R2 URL to the content file
   */
  async deleteBlogContent(contentUrl: string): Promise<void> {
    const key = this.extractKeyFromUrl(contentUrl);
    if (!key) {
      throw new StorageException('Invalid content URL');
    }
    await this.deleteFile(key);
  }

  /**
   * Upload blog cover image to R2
   * @param postId Blog post ID
   * @param file Image file buffer
   * @returns R2 URL to the uploaded image
   */
  async uploadBlogCoverImage(postId: string, file: Buffer): Promise<string> {
    const key = `blog/images/covers/${postId}-cover.webp`;

    const result = await this.uploadImage({
      key,
      file,
      contentType: 'image/webp', // Will be converted to WebP by processImage
      width: 1200, // Cover image width
      height: 630, // Cover image height (Open Graph recommended size)
    });

    return result.url;
  }
}

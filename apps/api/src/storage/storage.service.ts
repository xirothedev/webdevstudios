import {
  DeleteObjectCommand,
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
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      const baseUrl = this.config.publicUrl.endsWith('/')
        ? this.config.publicUrl.slice(0, -1)
        : this.config.publicUrl;

      if (url.startsWith(baseUrl)) {
        return url.replace(`${baseUrl}/`, '');
      }

      return null;
    } catch {
      return null;
    }
  }
}

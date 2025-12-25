export type CacheStrategy =
  | 'immutable'
  | 'long-lived'
  | 'short-lived'
  | 'no-cache';

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

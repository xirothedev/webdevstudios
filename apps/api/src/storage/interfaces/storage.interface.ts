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

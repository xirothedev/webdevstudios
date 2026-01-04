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

import { Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';

import { RedisService } from '../../redis/redis.service';

/**
 * ThrottlerStorageRecord interface
 * Matches the structure expected by @nestjs/throttler
 */
interface ThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

/**
 * Custom Redis storage adapter for Throttler
 * Implements ThrottlerStorage interface to use Redis for rate limiting
 * Uses existing RedisService to reuse Redis connection
 */
@Injectable()
export class ThrottlerRedisStorage implements ThrottlerStorage {
  constructor(private readonly redisService: RedisService) {}

  /**
   * Increment the count for a key and return storage record
   * This is the only method required by ThrottlerStorage interface
   */
  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string
  ): Promise<ThrottlerStorageRecord> {
    // Create separate keys for tracking and blocking
    const trackingKey = `throttler:${throttlerName}:${key}`;
    const blockKey = `throttler:block:${throttlerName}:${key}`;

    // Check if key is blocked
    const isBlocked = (await this.redisService.exists(blockKey)) > 0;
    const timeToBlockExpire = isBlocked
      ? (await this.redisService.ttl(blockKey)) * 1000
      : 0;

    // If blocked, return blocked status
    if (isBlocked) {
      const totalHits = parseInt(
        (await this.redisService.get(trackingKey)) || '0',
        10
      );
      return {
        totalHits,
        timeToExpire: (await this.redisService.ttl(trackingKey)) * 1000,
        isBlocked: true,
        timeToBlockExpire,
      };
    }

    // Increment the counter
    const exists = (await this.redisService.exists(trackingKey)) > 0;
    let totalHits: number;

    if (exists) {
      totalHits = await this.redisService.incr(trackingKey);
    } else {
      await this.redisService.set(
        trackingKey,
        '1',
        'EX',
        Math.ceil(ttl / 1000) // Convert milliseconds to seconds
      );
      totalHits = 1;
    }

    // Check if limit exceeded
    if (totalHits > limit) {
      // Block the key for blockDuration
      await this.redisService.set(
        blockKey,
        '1',
        'EX',
        Math.ceil(blockDuration / 1000) // Convert milliseconds to seconds
      );

      return {
        totalHits,
        timeToExpire: (await this.redisService.ttl(trackingKey)) * 1000,
        isBlocked: true,
        timeToBlockExpire: blockDuration,
      };
    }

    // Return normal record
    return {
      totalHits,
      timeToExpire: (await this.redisService.ttl(trackingKey)) * 1000,
      isBlocked: false,
      timeToBlockExpire: 0,
    };
  }
}

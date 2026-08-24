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

import { RedisService } from './redis.service';

interface ThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

@Injectable()
export class ThrottlerRedisStorage implements ThrottlerStorage {
  constructor(private readonly redisService: RedisService) {}

  // ponytail: resolved lazily; client is null until RedisService.onModuleInit runs
  private get client() {
    return this.redisService.getClient();
  }

  private get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  private async set(
    key: string,
    value: string,
    expiryMode: 'EX' | 'PX',
    time: number,
  ): Promise<void> {
    if (expiryMode === 'EX') {
      await this.client.setex(key, time, value);
    } else {
      await this.client.psetex(key, time, value);
    }
  }

  private exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  private ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  private incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const trackingKey = `throttler:${throttlerName}:${key}`;
    const blockKey = `throttler:block:${throttlerName}:${key}`;

    const isBlocked = (await this.exists(blockKey)) > 0;
    const timeToBlockExpire = isBlocked ? (await this.ttl(blockKey)) * 1000 : 0;

    if (isBlocked) {
      const totalHits = parseInt((await this.get(trackingKey)) || '0', 10);
      return {
        totalHits,
        timeToExpire: (await this.ttl(trackingKey)) * 1000,
        isBlocked: true,
        timeToBlockExpire,
      };
    }

    const keyExists = (await this.exists(trackingKey)) > 0;
    let totalHits: number;

    if (keyExists) {
      totalHits = await this.incr(trackingKey);
    } else {
      await this.set(trackingKey, '1', 'EX', Math.ceil(ttl / 1000));
      totalHits = 1;
    }

    if (totalHits > limit) {
      await this.set(blockKey, '1', 'EX', Math.ceil(blockDuration / 1000));

      return {
        totalHits,
        timeToExpire: (await this.ttl(trackingKey)) * 1000,
        isBlocked: true,
        timeToBlockExpire: blockDuration,
      };
    }

    return {
      totalHits,
      timeToExpire: (await this.ttl(trackingKey)) * 1000,
      isBlocked: false,
      timeToBlockExpire: 0,
    };
  }
}

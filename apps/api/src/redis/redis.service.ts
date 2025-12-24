import {
  Injectable,
  InternalServerErrorException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import Redis from 'ioredis';

import { VerificationDto } from './redis.dto';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly config: ConfigService) {}

  private client: Redis;

  async onModuleInit() {
    try {
      this.client = new Redis({
        host: this.config.getOrThrow<string>('REDIS_HOST', 'localhost'),
        port: this.config.getOrThrow<number>('REDIS_PORT', 6379),
      });

      this.client.on('error', (err: unknown) =>
        console.error('Redis Client Error', err)
      );

      // ioredis connects automatically, but we can wait for ready event
      await new Promise<void>((resolve, reject) => {
        this.client.once('ready', () => resolve());
        this.client.once('error', (err) => reject(err));
      });
    } catch {
      throw new InternalServerErrorException('Failed connecting to Redis');
    }
  }

  async onModuleDestroy() {
    // quit only if the client exists and is connected
    if (this.client && this.client.status === 'ready') {
      await this.client.quit();
    }
  }

  async hSet(key: string, data: VerificationDto): Promise<void> {
    const { id, tries } = data;
    await this.client.hset(key, 'id', id, 'tries', tries.toString());
    await this.client.expire(
      key,
      this.config.getOrThrow<number>('REDIS_TTL', 300)
    );
  }

  async hGet(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  async hGetAll(key: string): Promise<VerificationDto> {
    const result = await this.client.hgetall(key);
    // Convert tries from string to number
    const parsedResult = {
      ...result,
      tries: result.tries ? parseInt(result.tries, 10) : 0,
    };
    return plainToClass(VerificationDto, parsedResult);
  }

  async hIncrBy(key: string, field: string, increment = 1): Promise<number> {
    const value = await this.client.hincrby(key, field, increment);
    return value;
  }

  async hDel(key: string, field: string): Promise<void> {
    await this.client.hdel(key, field);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}

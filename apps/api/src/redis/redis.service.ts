import {
  Injectable,
  InternalServerErrorException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { createClient, type RedisClientType } from 'redis';

import { VerificationDto } from './redis.dto';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly config: ConfigService) {}

  private client: RedisClientType;

  async onModuleInit() {
    this.client = createClient({
      // url: this.config.get<string>('REDIS_URL') || 'redis://localhost:6379',
    });

    this.client.on('error', (err: unknown) =>
      console.error('Redis Client Error', err)
    );

    try {
      await this.client.connect();
    } catch {
      throw new InternalServerErrorException('Failed connecting to Redis');
    }
  }

  async onModuleDestroy() {
    // quit only if the client exists and is open
    if (this.client && (this.client as any).isOpen) {
      await this.client.quit();
    }
  }

  async hSet(key: string, data: VerificationDto): Promise<void> {
    const { id, tries } = data;
    await this.client.hSet(key, { id, tries });
    this.client.expire(key, this.config.getOrThrow<number>('REDIS_TTL') ?? 300);
  }

  async hGet(key: string, field: string): Promise<string | null> {
    return this.client.hGet(key, field);
  }

  async hGetAll(key: string): Promise<VerificationDto> {
    return plainToClass(VerificationDto, await this.client.hGetAll(key));
  }

  async hIncrBy(key: string, field: string, increment = 1): Promise<number> {
    const value = await this.client.hIncrBy(key, field, increment);
    return value;
  }

  async hDel(key: string, field: string): Promise<void> {
    await this.client.hDel(key, field);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageConfig {
  constructor(private readonly configService: ConfigService) {}

  get accountId(): string {
    return this.configService.getOrThrow<string>('R2_ACCOUNT_ID');
  }

  get accessKeyId(): string {
    return this.configService.getOrThrow<string>('R2_ACCESS_KEY_ID');
  }

  get secretAccessKey(): string {
    return this.configService.getOrThrow<string>('R2_SECRET_ACCESS_KEY');
  }

  get bucketName(): string {
    return this.configService.getOrThrow<string>('R2_BUCKET_NAME');
  }

  get publicUrl(): string {
    return this.configService.getOrThrow<string>('R2_PUBLIC_URL');
  }

  get endpoint(): string {
    return (
      this.configService.get<string>('R2_ENDPOINT') ||
      `https://${this.accountId}.r2.cloudflarestorage.com`
    );
  }
}

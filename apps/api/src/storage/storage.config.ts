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

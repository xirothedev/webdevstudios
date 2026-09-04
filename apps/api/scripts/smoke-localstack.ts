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

/// <reference types="node" />

/**
 * Smoke check: apps/api StorageService against a LocalStack S3 endpoint.
 * Run from apps/api with the stack up:
 *   bun run scripts/smoke-localstack.ts
 * Env overrides supported; defaults match a local LocalStack (port 4566).
 */
import { ConfigService } from '@nestjs/config';

import { StorageConfig } from '../src/storage/storage.config';
import { StorageService } from '../src/storage/storage.service';

Object.assign(process.env, {
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID ?? 'smoke',
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ?? 'test',
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ?? 'test',
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME ?? 'webdevstudios-storage',
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL ?? 'http://127.0.0.1:4566/webdevstudios-storage',
  R2_ENDPOINT: process.env.R2_ENDPOINT ?? 'http://127.0.0.1:4566',
  R2_FORCE_PATH_STYLE: 'true',
});

async function main(): Promise<void> {
  const service = new StorageService(new StorageConfig(new ConfigService({ ...process.env })));

  const key = `smoke/${Date.now()}.md`;
  const content = `# localstack smoke ${new Date().toISOString()}`;

  const uploaded = await service.uploadFile({
    key,
    file: Buffer.from(content, 'utf-8'),
    contentType: 'text/markdown',
  });
  if (uploaded.url !== `${process.env.R2_PUBLIC_URL}/${key}`) {
    throw new Error(`unexpected url: ${uploaded.url}`);
  }

  const fetched = await service.getBlogContent(key);
  if (fetched !== content) {
    throw new Error(`round-trip mismatch: ${fetched.slice(0, 80)}`);
  }

  await service.deleteFile(key);
  let deleted = false;
  try {
    await service.getBlogContent(key);
  } catch {
    deleted = true;
  }
  if (!deleted) {
    throw new Error('object still readable after deleteFile');
  }

  console.log(`localstack storage smoke OK (${process.env.R2_ENDPOINT})`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

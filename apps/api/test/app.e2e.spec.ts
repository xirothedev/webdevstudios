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

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import cookieParser from 'cookie-parser';
import type { App } from 'supertest/types';

import { AppModule } from '../src/app.module';
import { TokenStorageService } from '../src/auth/infrastructure/token-storage.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { RedisService } from '../src/redis/redis.service';

Object.assign(process.env, {
  CSRF_SECRET: 'test-csrf-secret',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/webdevstudios_test',
  GITHUB_CALLBACK_URL: 'http://localhost:4000/v1/auth/github/callback',
  GITHUB_CLIENT_ID: 'test-github-client-id',
  GITHUB_CLIENT_SECRET: 'test-github-client-secret',
  GOOGLE_CALLBACK_URL: 'http://localhost:4000/v1/auth/google/callback',
  GOOGLE_CLIENT_ID: 'test-google-client-id',
  GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
  JWT_ACCESS_TOKEN_EXPIRES_IN: '900000',
  JWT_SECRET_KEY: 'test-jwt-secret',
  MAIL_HOST: 'localhost',
  MAIL_PASS: 'test-password',
  MAIL_PORT: '1025',
  MAIL_USER: 'test@example.com',
  PAYOS_API_KEY: 'test-payos-api-key',
  PAYOS_CHECKSUM_KEY: 'test-payos-checksum-key',
  PAYOS_CLIENT_ID: 'test-payos-client-id',
  PORT: '4000',
  R2_ACCESS_KEY_ID: 'test-access-key',
  R2_ACCOUNT_ID: 'test-account',
  R2_BUCKET_NAME: 'test-bucket',
  R2_PUBLIC_URL: 'http://localhost/r2',
  R2_SECRET_ACCESS_KEY: 'test-secret-key',
  REDIS_TTL: '300',
  SESSION_SECRET: 'test-session-secret',
  SWAGGER_PASSWORD: 'test-swagger-password',
  SWAGGER_USERNAME: 'test-swagger-user',
});

const redisServiceMock = {
  exists: async () => 0,
  get: async () => null,
  incr: async () => 1,
  set: async () => undefined,
  ttl: async () => 1,
};

const prismaServiceMock = {
  $connect: async () => undefined,
  $disconnect: async () => undefined,
  order: {
    findMany: async () => [],
  },
};

const tokenStorageServiceMock = {
  deleteEmailVerificationToken: async () => undefined,
  deletePasswordResetToken: async () => undefined,
  deleteSessionMfaVerified: async () => undefined,
  getEmailVerificationToken: async () => null,
  getPasswordResetToken: async () => null,
  getSessionMfaVerified: async () => true,
  storeEmailVerificationToken: async () => undefined,
  storePasswordResetToken: async () => undefined,
  storeSessionMfaVerified: async () => undefined,
};

describe('AppController (e2e)', () => {
  let app: INestApplication<App> | undefined;
  let baseUrl: string | undefined;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .overrideProvider(RedisService)
      .useValue(redisServiceMock)
      .overrideProvider(TokenStorageService)
      .useValue(tokenStorageServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
    const port = 45000 + (process.pid % 10000);
    await app.listen(port, '127.0.0.1');
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    await app?.close();
  });

  it('/csrf-token (GET)', async () => {
    if (!baseUrl) {
      throw new Error('Nest application failed to initialize');
    }

    const response = await fetch(`${baseUrl}/csrf-token`);
    const body = (await response.json()) as { csrfToken?: unknown };

    expect(response.status).toBe(200);
    expect(typeof body.csrfToken).toBe('string');
    expect((body.csrfToken as string).length).toBeGreaterThan(0);
  });
});

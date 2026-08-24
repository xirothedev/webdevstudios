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

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { describe, expect, mock, onTestFinished, setSystemTime, test } from 'bun:test';

import { AppModule } from '../src/app.module';
import { TokenStorageService } from '../src/auth/infrastructure/token-storage.service';
import { MailService } from '../src/mail/mail.service';
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

// ---------------------------------------------------------------------------
// In-memory Prisma fake: stateful for user/session/device, noop for the rest.
// ponytail: Proxy fallback swallows unmodeled models (security logs, MFA...);
// give a model real handlers only when an e2e journey touches it.
// ---------------------------------------------------------------------------
const makePrismaFake = () => {
  const users = new Map<string, Record<string, unknown>>();
  const usersByEmail = new Map<string, string>();
  const sessions = new Map<string, Record<string, unknown>>();
  let seq = 0;
  const id = (prefix: string) => `${prefix}-${++seq}`;

  const noopModel = () =>
    new Proxy(
      {},
      {
        get: (_t, method) => (method === 'then' ? undefined : async () => ({ count: 0 })),
      },
    );

  const base = {
    $connect: async () => undefined,
    $disconnect: async () => undefined,
    user: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const row = { ...data, id: id('user'), createdAt: new Date(), updatedAt: new Date() };
        users.set(String(row.id), row);
        if (row.email) usersByEmail.set(String(row.email), String(row.id));
        return row;
      },
      findUnique: async ({ where }: { where: Record<string, unknown> }) =>
        users.get(where.email ? (usersByEmail.get(String(where.email)) ?? '') : String(where.id)) ??
        null,
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const row = { ...users.get(where.id), ...data, updatedAt: new Date() };
        users.set(where.id, row);
        return row;
      },
    },
    device: {
      create: async ({ data }: { data: Record<string, unknown> }) => ({
        ...data,
        id: id('device'),
        lastSeenAt: new Date(),
      }),
    },
    session: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const row = {
          status: 'ACTIVE',
          ...data,
          id: id('session'),
          createdAt: new Date(),
          user: users.get(String(data.userId)),
        };
        sessions.set(String(row.id), row);
        return row;
      },
      findFirst: async ({ where }: { where: Record<string, unknown> }) => {
        for (const session of sessions.values()) {
          if (session.refreshToken === where.refreshToken) return session;
        }
        return null;
      },
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const row = { ...sessions.get(where.id), ...data };
        sessions.set(where.id, row);
        return row;
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: Record<string, unknown>;
        data: Record<string, unknown>;
      }) => {
        let count = 0;
        for (const [sid, session] of sessions) {
          if (where.id && sid !== where.id) continue;
          if (where.userId && session.userId !== where.userId) continue;
          Object.assign(session, data);
          count++;
        }
        return { count };
      },
    },
  };
  return new Proxy(base, {
    get: (target, prop) => target[prop as keyof typeof target] ?? noopModel(),
  }) as unknown as PrismaService;
};

// ponytail: explicit mock — a Proxy-based fake hangs Nest init (every property
// read resolves to a function, confusing lifecycle-hook detection); list exactly
// what the flows touch instead
const redisFake = {
  exists: async () => 0,
  get: async () => null,
  incr: async () => 1,
  set: async () => undefined,
  ttl: async () => 1,
} as unknown as RedisService;

const tokenStore = {
  emailTokens: new Map<string, string>(),
};
const tokenStorageFake = {
  storeEmailVerificationToken: async (token: string, userId: string) => {
    tokenStore.emailTokens.set(token, userId);
  },
  getEmailVerificationToken: async (token: string) => tokenStore.emailTokens.get(token) ?? null,
  deleteEmailVerificationToken: async (token: string) => {
    tokenStore.emailTokens.delete(token);
  },
  storePasswordResetToken: async () => undefined,
  getPasswordResetToken: async () => null,
  deletePasswordResetToken: async () => undefined,
  storeSessionMfaVerified: async () => undefined,
  getSessionMfaVerified: async () => false,
  deleteSessionMfaVerified: async () => undefined,
} as unknown as TokenStorageService;

const mailMock = {
  sendVerificationEmail: mock(async () => undefined),
  sendPasswordResetEmail: mock(async () => undefined),
};

type Booted = { app: INestApplication; baseUrl: string };

const bootApp = async (): Promise<Booted> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(makePrismaFake())
    .overrideProvider(RedisService)
    .useValue(redisFake)
    .overrideProvider(TokenStorageService)
    .useValue(tokenStorageFake)
    .overrideProvider(MailService)
    .useValue(mailMock)
    .compile();

  const app = moduleFixture.createNestApplication();
  // mirror main.ts bootstrap pieces the journeys rely on
  app.setGlobalPrefix('v1');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  await app.init();
  const port = 45000 + ((process.pid * 7) % 10000);
  await app.listen(port, '127.0.0.1');

  // bun:test >= 1.2: per-test cleanup without afterEach bookkeeping
  onTestFinished(() => app.close());

  return { app, baseUrl: `http://127.0.0.1:${port}` };
};

const cookiesFrom = (response: Response): string =>
  response.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ');

describe('App API (e2e)', () => {
  test('GET /v1 is default-denied by the global auth guard', async () => {
    const { baseUrl } = await bootApp();

    const response = await fetch(`${baseUrl}/v1`);
    expect(response.status).toBe(401);
  });

  test('GET /v1/csrf-token plants a CSRF cookie', async () => {
    const { baseUrl } = await bootApp();

    const response = await fetch(`${baseUrl}/v1/csrf-token`);
    const body = (await response.json()) as { csrfToken?: unknown };

    expect(response.status).toBe(200);
    expect(typeof body.csrfToken).toBe('string');
    expect((body.csrfToken as string).length).toBeGreaterThan(0);
    expect(response.headers.getSetCookie().join()).toContain('_csrf=');
  });
});

describe('Auth journey (e2e)', () => {
  const registerBody = {
    email: 'journey@example.com',
    password: 'SuperSecure123!',
    fullName: 'Journey User',
  };

  test('register → verify → login → me → refresh → logout', async () => {
    const { baseUrl } = await bootApp();

    // register
    const registered = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(registerBody),
    });
    expect(registered.status).toBe(201);
    const registeredBody = (await registered.json()) as { data: { userId: string } };
    const { userId } = registeredBody.data;
    expect(userId).toBeTruthy();
    expect(mailMock.sendVerificationEmail.mock.calls.length).toBeGreaterThan(0);

    // login is blocked before verification
    const earlyLogin = await fetch(`${baseUrl}/v1/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: registerBody.email, password: registerBody.password }),
    });
    expect(earlyLogin.status).toBe(400);

    // verify via the exact token the service stored
    expect(tokenStore.emailTokens.size).toBe(1);
    const [token] = [...tokenStore.emailTokens.keys()];
    const verified = await fetch(`${baseUrl}/v1/auth/verify-email?token=${token}`);
    expect(verified.status).toBe(200);

    // login sets cookies and returns tokens
    const login = await fetch(`${baseUrl}/v1/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: registerBody.email, password: registerBody.password }),
    });
    expect(login.status).toBe(200);
    const loginCookies = cookiesFrom(login);
    const loginBody = (await login.json()) as {
      data: { accessToken: string; refreshToken: string; user: { email: string } };
    };
    const tokens = loginBody.data;
    expect(tokens.user.email).toBe(registerBody.email);
    expect(loginCookies).toContain(`access_token=${tokens.accessToken}`);
    expect(loginCookies).toContain('refresh_token=');

    // me with the access cookie
    const me = await fetch(`${baseUrl}/v1/auth/me`, {
      headers: { cookie: `access_token=${tokens.accessToken}` },
    });
    expect(me.status).toBe(200);
    const meUser = ((await me.json()) as { data: { id: string; email: string } }).data;
    expect(meUser.id).toBe(userId);
    expect(meUser.email).toBe(registerBody.email);

    // refresh rotates both tokens — jump past the 1s JWT iat resolution so
    // rotation is observable
    setSystemTime(Date.now() + 5_000);
    onTestFinished(() => setSystemTime());
    const refreshed = await fetch(`${baseUrl}/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });
    expect(refreshed.status).toBe(200);
    const rotated = ((await refreshed.json()) as { data: { refreshToken: string } }).data;
    expect(rotated.refreshToken).not.toBe(tokens.refreshToken);

    // logout revokes everything
    const logout = await fetch(`${baseUrl}/v1/auth/logout`, {
      method: 'POST',
      headers: { cookie: `access_token=${tokens.accessToken}` },
    });
    expect(logout.status).toBe(200);
    expect(((await logout.json()) as { data: { success: boolean } }).data.success).toBe(true);

    // the rotated refresh token no longer works after revocation
    const staleRefresh = await fetch(`${baseUrl}/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: rotated.refreshToken }),
    });
    expect(staleRefresh.status).toBe(401);
  });

  test('duplicate registration conflicts', async () => {
    const { baseUrl } = await bootApp();

    const first = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(registerBody),
    });
    expect(first.status).toBe(201);

    const second = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(registerBody),
    });
    expect(second.status).toBe(409);
  });

  test.each([
    ['missing password', { email: 'a@example.com', fullName: 'A' }],
    ['invalid email', { email: 'not-an-email', password: 'SuperSecure123!' }],
    ['non-whitelisted field', { email: 'b@example.com', password: 'SuperSecure123!', admin: true }],
  ])('register rejects %s with 400', async (_label: string, badBody: Record<string, unknown>) => {
    const { baseUrl } = await bootApp();

    const response = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(badBody),
    });

    expect(response.status).toBe(400);
  });

  test('login with wrong password is unauthorized', async () => {
    const { baseUrl } = await bootApp();

    await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(registerBody),
    });
    const [token] = [...tokenStore.emailTokens.keys()];
    await fetch(`${baseUrl}/v1/auth/verify-email?token=${token}`);

    const response = await fetch(`${baseUrl}/v1/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: registerBody.email, password: 'WrongPassword1!' }),
    });

    expect(response.status).toBe(401);
  });

  test('/v1/auth/me requires authentication', async () => {
    const { baseUrl } = await bootApp();

    const response = await fetch(`${baseUrl}/v1/auth/me`);

    expect(response.status).toBe(401);
  });
});

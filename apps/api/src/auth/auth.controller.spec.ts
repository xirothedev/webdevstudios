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

import { describe, expect, test } from 'bun:test';
import type { Request, Response } from 'express';

import { AuthController } from './auth.controller';
import { AuthCookies } from './services/auth-cookies.service';

const req = {
  ip: '10.0.0.1',
  socket: { remoteAddress: '10.0.0.1' },
  get: () => 'Mozilla/5.0',
  cookies: {},
} as unknown as Request;

const makeController = (
  authService: Record<string, unknown>,
  overrides: Record<string, Record<string, unknown>> = {},
) => {
  const sets: { tokens: unknown; ttlSeconds: number }[] = [];
  let cleared = 0;
  const res = {} as Response;

  const authCookies = {
    set: (_res: Response, tokens: unknown, ttlSeconds: number) => {
      sets.push({ tokens, ttlSeconds });
    },
    clear: () => {
      cleared++;
    },
    ...overrides.authCookies,
  };

  const controller = new AuthController(
    authService as never,
    (overrides.oauthService ?? {}) as never,
    (overrides.oauthRedirectService ?? {}) as never,
    authCookies as unknown as AuthCookies,
  );

  return { controller, sets, clearedCount: () => cleared, res };
};

describe('AuthController cookie wiring', () => {
  test('login writes cookies with exactly the ttl the service issued', async () => {
    const ttl = 30 * 24 * 60 * 60;
    const result = { accessToken: 'a', refreshToken: 'r', ttlSeconds: ttl, user: { id: 'u1' } };
    const { controller, sets, res } = makeController({
      login: async () => result,
    });

    await controller.login(
      { email: 'e@x.com', password: 'pw', rememberMe: true } as never,
      req,
      res,
    );

    expect(sets).toEqual([{ tokens: result, ttlSeconds: ttl }]);
  });

  test('2FA-challenge login writes no cookies', async () => {
    const { controller, sets, res } = makeController({
      login: async () => ({
        accessToken: '',
        refreshToken: '',
        user: { id: 'u1' },
        requires2FA: true,
      }),
    });

    await controller.login({ email: 'e@x.com', password: 'pw' } as never, req, res);

    expect(sets).toEqual([]);
  });

  test('refresh writes cookies with the remaining session ttl', async () => {
    const result = { accessToken: 'a2', refreshToken: 'r2', ttlSeconds: 555 };
    const { controller, sets, res } = makeController({
      refresh: async () => result,
    });

    await controller.refresh(req, res, 'current-refresh-token');

    expect(sets).toEqual([{ tokens: result, ttlSeconds: 555 }]);
  });

  test('verify2FA completion writes cookies with the issuer ttl; setup-only does not', async () => {
    const completing = makeController({
      verify2FA: async () => ({
        accessToken: 'a',
        refreshToken: 'r',
        ttlSeconds: 7 * 24 * 60 * 60,
        user: { id: 'u1' },
      }),
    });
    await completing.controller.verify2FA(
      { code: '123456', sessionId: 'pending' } as never,
      { id: 'u1' },
      req,
      completing.res,
    );
    expect(completing.sets).toEqual([
      { tokens: { accessToken: 'a', refreshToken: 'r' }, ttlSeconds: 7 * 24 * 60 * 60 },
    ]);

    const setupOnly = makeController({
      verify2FA: async () => ({ verified: true }),
    });
    await setupOnly.controller.verify2FA(
      { code: '123456' } as never,
      { id: 'u1' },
      req,
      setupOnly.res,
    );
    expect(setupOnly.sets).toEqual([]);
  });

  test('logout clears cookies through the adapter', async () => {
    const { controller, clearedCount, res } = makeController({
      logout: async () => ({ success: true }),
    });

    await controller.logout({ id: 'u1' }, req, res);

    expect(clearedCount()).toBe(1);
  });
});

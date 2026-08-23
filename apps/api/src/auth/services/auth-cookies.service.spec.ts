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
import type { Response } from 'express';

import { AuthCookies } from './auth-cookies.service';

interface CookieCall {
  name: string;
  value: string;
  options: Record<string, unknown>;
}

const makeRes = () => {
  const cookies: CookieCall[] = [];
  const cleared: { name: string; options: Record<string, unknown> }[] = [];
  const res = {
    cookie: (name: string, value: string, options: Record<string, unknown>) => {
      cookies.push({ name, value, options });
    },
    clearCookie: (name: string, options: Record<string, unknown>) => {
      cleared.push({ name, options });
    },
  };
  return { cookies, cleared, res: res as unknown as Response };
};

const makeAuthCookies = (env: string | undefined) =>
  new AuthCookies({ get: (key: string) => (key === 'NODE_ENV' ? env : undefined) } as never);

const tokens = { accessToken: 'access-1', refreshToken: 'refresh-1' };

describe('AuthCookies.set', () => {
  test('refresh_token maxAge is exactly the supplied ttl in ms', () => {
    const { res, cookies } = makeRes();

    makeAuthCookies('production').set(res, tokens, 30 * 24 * 60 * 60);

    const refresh = cookies.find((c) => c.name === 'refresh_token')!;
    expect(refresh.value).toBe('refresh-1');
    expect(refresh.options.maxAge).toBe(30 * 24 * 60 * 60 * 1000);
  });

  test('an arbitrary ttl round-trips without drift', () => {
    const { res, cookies } = makeRes();

    makeAuthCookies(undefined).set(res, tokens, 555);

    const refresh = cookies.find((c) => c.name === 'refresh_token')!;
    expect(refresh.options.maxAge).toBe(555_000);
  });

  test('cookie attributes are unchanged: httpOnly, lax, root path, 15min access', () => {
    const { res, cookies } = makeRes();

    makeAuthCookies(undefined).set(res, tokens, 7 * 24 * 60 * 60);

    for (const name of ['access_token', 'refresh_token']) {
      const call = cookies.find((c) => c.name === name)!;
      expect(call.options).toMatchObject({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
    }
    expect(cookies.find((c) => c.name === 'access_token')!.options.maxAge).toBe(15 * 60 * 1000);
  });

  test('secure flag comes from ConfigService NODE_ENV, not raw process.env', () => {
    const prod = makeRes();
    makeAuthCookies('production').set(prod.res, tokens, 60);
    expect(prod.cookies[0].options.secure).toBe(true);
    expect(prod.cookies[1].options.secure).toBe(true);

    const dev = makeRes();
    makeAuthCookies(undefined).set(dev.res, tokens, 60);
    expect(dev.cookies[0].options.secure).toBe(false);
    expect(dev.cookies[1].options.secure).toBe(false);
  });
});

describe('AuthCookies.clear', () => {
  test('clears both auth cookies on the root path', () => {
    const { res, cleared } = makeRes();

    makeAuthCookies(undefined).clear(res);

    expect(cleared.map((c) => c.name)).toEqual(['access_token', 'refresh_token']);
    for (const call of cleared) {
      expect(call.options).toEqual({ path: '/' });
    }
  });
});

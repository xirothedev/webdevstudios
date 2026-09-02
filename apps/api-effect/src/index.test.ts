import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import speakeasy from 'speakeasy';
import { HttpRouter } from 'effect/unstable/http';

// Fail fast on the closed port so getRedis() resolves null instead of hanging.
process.env.REDIS_PORT = '6399';
process.env.PAYOS_CHECKSUM_KEY = 'testsecret';

import { appLayer } from './index';
import { generateCsrfToken, validCsrfToken } from './lib/csrf';
import { signAccess, verifyToken } from './lib/jwt';
import { hashPassword, verifyPassword } from './lib/password';
import { generateBackupCodes, generateTotpSecret, verifyTotp } from './lib/totp';
import { buildCanonicalString, verifyWebhookSignature } from './lib/payos';
import { bindBody } from './lib/validate';
import { goTime } from './lib/util';

let server: { handler: (request: Request) => Promise<Response>; dispose: () => Promise<void> };

beforeAll(() => {
  server = HttpRouter.toWebHandler(appLayer('http://localhost:3000'));
});

afterAll(() => server.dispose());

const handle = (request: Request): Promise<Response> => server.handler(request);

describe('payos webhook signature', () => {
  it('verifies the Go test vector', () => {
    const raw =
      '{"code":"00","desc":"success","success":true,"data":{"accountNumber":"1","amount":130000,"code":"00","currency":"VND","description":"pay","desc":"ok","orderCode":29974,"paymentLinkId":"TESTLINK123","reference":"r1","transactionDateTime":"2026-08-24T00:00:00+07:00"},"signature":"e19b5c66d0cfe86a542ecfb0db96cb238d301b914bcaef78bd90d54d0d03fd07"}';
    expect(verifyWebhookSignature(JSON.parse(raw))).toBe(true);
  });

  it('rejects a tampered signature', () => {
    const envelope: Record<string, unknown> = {
      success: true,
      data: { amount: 1 },
      signature: '0'.repeat(64),
    };
    expect(verifyWebhookSignature(envelope)).toBe(false);
  });

  it('canonical string is sorted key=value pairs over the data object (signature lives on the envelope)', () => {
    const data = { a: 1, b: 'two', c: [3, 4], d: { e: false }, signature: 'drop-me' };
    expect(buildCanonicalString(data)).toBe('a=1&b=two&c=[3,4]&d={"e":false}&signature=drop-me');
  });
});

describe('csrf', () => {
  it('round-trips issued tokens', () => {
    const token = generateCsrfToken();
    expect(validCsrfToken(token)).toBe(true);
  });

  it('rejects tampered and malformed tokens', () => {
    const token = generateCsrfToken();
    const dot = token.indexOf('.');
    const random = token.slice(dot + 1);
    expect(validCsrfToken(`deadbeef${'0'.repeat(28)}.${random}`)).toBe(false);
    expect(validCsrfToken('nodot')).toBe(false);
    expect(validCsrfToken('')).toBe(false);
  });
});

describe('jwt', () => {
  const secret = 'unit-test-secret';

  it('round-trips access claims', async () => {
    const token = await signAccess(secret, 'user-1', 'a@b.c', 'ADMIN', 'sess-1', 900);
    const claims = await verifyToken(secret, token);
    expect(claims).toEqual({ sub: 'user-1', jti: 'sess-1', email: 'a@b.c', role: 'ADMIN' });
  });

  it('rejects a wrong secret', async () => {
    const token = await signAccess(secret, 'user-1', '', '', '', 900);
    expect(await verifyToken('other-secret', token)).toBeNull();
  });
});

describe('password', () => {
  it('hashes with Go-compatible argon2id layout', async () => {
    const hash = await hashPassword('correct-horse');
    expect(hash.startsWith('$argon2id$v=19$m=19456,t=2,p=1$')).toBe(true);
    expect(await verifyPassword(hash, 'correct-horse')).toBe(true);
    expect(await verifyPassword(hash, 'wrong')).toBe(false);
  });
});

describe('totp', () => {
  it('verifies a freshly generated code and rejects a wrong one', () => {
    const secret = generateTotpSecret();
    const code = speakeasy.totp({
      secret,
      encoding: 'base32',
      counter: Math.floor(Date.now() / 30_000),
    });
    expect(verifyTotp(secret, code)).toBe(true);
    expect(verifyTotp(secret, '000000')).toBe(false);
  });

  it('generates eight-digit backup codes', () => {
    expect(generateBackupCodes(10)).toHaveLength(10);
    expect(generateBackupCodes(1)[0]).toMatch(/^\d{8}$/);
  });
});

describe('validate.bindBody', () => {
  it('rejects unknown keys with the raw JSON key', () => {
    expect(() => bindBody({ bogus: 1 }, { A: { type: 'string' } })).toThrow(
      'property bogus should not exist',
    );
  });

  it('reports a zero-value nested struct once, without inner fields', () => {
    const err = (() => {
      try {
        bindBody(
          { user: {} },
          {
            User: {
              type: 'object',
              required: true,
              fields: {
                FullName: { type: 'string', required: true },
                Email: { type: 'string', email: true },
              },
            },
          },
        );
      } catch (e) {
        return e as { messageValue?: unknown };
      }
    })();
    expect(err?.messageValue).toEqual(['user should not be empty']);
  });

  it('uses leaf Go field names for nested failures', () => {
    const err = (() => {
      try {
        bindBody(
          { user: { fullName: '' } },
          {
            User: {
              type: 'object',
              fields: {
                FullName: { type: 'string', required: true },
                Email: { type: 'string', email: true },
              },
            },
          },
        );
      } catch (e) {
        return e as { messageValue?: unknown };
      }
    })();
    expect(err?.messageValue).toEqual(['fullName should not be empty']);
  });

  it('reports unknown nested keys', () => {
    expect(() =>
      bindBody(
        { user: { bogus: 1 } },
        { User: { type: 'object', fields: { FullName: { type: 'string' } } } },
      ),
    ).toThrow('property bogus should not exist');
  });

  it('rejects fractional numbers on integer fields', () => {
    expect(() => bindBody({ rating: 1.5 }, { Rating: { type: 'number', integer: true } })).toThrow(
      'property rating must be a number',
    );
  });

  it('skips omitempty fields on zero values', () => {
    expect(
      bindBody<{ fullName?: string }>(
        { fullName: '' },
        { FullName: { type: 'string', omitempty: true, minLen: 1 } },
      ),
    ).toEqual({
      fullName: '',
    });
    expect(() =>
      bindBody<{ x?: number }>({ x: 1.5 }, { X: { type: 'number', omitempty: true } }),
    ).not.toThrow();
  });
});

describe('goTime', () => {
  it('formats Go-style RFC3339 without milliseconds when zero', () => {
    expect(goTime(new Date('2026-01-01T00:00:00.000Z'))).toBe('2026-01-01T00:00:00Z');
    expect(goTime(new Date('2026-01-01T00:00:00.123Z'))).toBe('2026-01-01T00:00:00.123Z');
    expect(goTime(null)).toBeNull();
  });
});

describe('app smoke (no DB)', () => {
  it('answers /v1/ping', async () => {
    const res = await handle(new Request('http://localhost/v1/ping'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ message: 'pong from effect' });
  });

  it('maps unknown routes to the Nest-style 404 body', async () => {
    const res = await handle(new Request('http://localhost/v1/nope'));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      statusCode: 404,
      message: 'Cannot GET /v1/nope',
      error: 'Not Found',
    });
  });

  it('blocks a state-changing request without a CSRF token', async () => {
    const res = await handle(
      new Request('http://localhost/v1/orders', {
        method: 'POST',
        body: '{}',
        headers: { 'content-type': 'application/json' },
      }),
    );
    expect(res.status).toBe(403);
    expect((await res.json()).message).toBe('Invalid CSRF token');
  });

  it('issues a CSRF token plus cookie', async () => {
    const res = await handle(new Request('http://localhost/v1/csrf-token'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.csrfToken).toBe('string');
    const cookieHeader = res.headers.get('set-cookie') ?? '';
    expect(cookieHeader).toContain('_csrf=');
    expect(cookieHeader).toContain('HttpOnly');
  });

  it('refresh rejects an empty token', async () => {
    const res = await handle(
      new Request('http://localhost/v1/auth/refresh', {
        method: 'POST',
        body: '{}',
        headers: { 'content-type': 'application/json' },
      }),
    );
    expect(res.status).toBe(401);
    expect((await res.json()).message).toBe('Invalid refresh token');
  });

  it('refresh rejects an unparseable refresh token', async () => {
    const res = await handle(
      new Request('http://localhost/v1/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'garbage' }),
        headers: { 'content-type': 'application/json' },
      }),
    );
    expect(res.status).toBe(401);
    expect((await res.json()).message).toBe('Invalid or expired session');
  });

  it('login reports class-validator style messages', async () => {
    // CSRF applies to login (mirrors Go middleware exemptions).
    const tokenRes = await handle(new Request('http://localhost/v1/csrf-token'));
    const { csrfToken } = await tokenRes.json();
    const res = await handle(
      new Request('http://localhost/v1/auth/login', {
        method: 'POST',
        body: '{}',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': csrfToken,
          cookie: `_csrf=${csrfToken}`,
        },
      }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).message).toEqual([
      'email should not be empty',
      'password should not be empty',
    ]);
  });
});

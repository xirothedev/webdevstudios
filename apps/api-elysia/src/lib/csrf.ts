import type { Cookie } from 'elysia';
import { createHmac } from 'node:crypto';

import { ApiError } from './errors';
import { randomHex, safeEqual } from './util';

export type GuardContext = {
  request: Request;
  path: string;
  cookie: Record<string, Cookie<unknown>>;
};

const EXEMPT_PREFIXES = ['/v1/auth/oauth', '/v1/payments/webhook'];
const EXEMPT_EXACT = '/v1/auth/refresh';

function secret(): string {
  return process.env.CSRF_SECRET || `derived-${process.env.JWT_SECRET_KEY ?? ''}`;
}

function hmacHex(key: string, data: string): string {
  return createHmac('sha256', key).update(data).digest('hex');
}

export function generateCsrfToken(): string {
  const random = randomHex(32);
  return `${hmacHex(secret(), random)}.${random}`;
}

export function validCsrfToken(token: string): boolean {
  const dot = token.indexOf('.');
  if (dot <= 0 || dot === token.length - 1) {
    return false;
  }
  return safeEqual(hmacHex(secret(), token.slice(dot + 1)), token.slice(0, dot));
}

export function issueCsrfToken(cookie: Record<string, Cookie<unknown>>, value: string): void {
  const slot = cookie._csrf;
  slot.value = value;
  slot.httpOnly = true;
  slot.path = '/';
  slot.sameSite = 'lax';
  slot.maxAge = 3600;
}

export function csrfGuard(ctx: GuardContext): void {
  if (
    ctx.request.method === 'GET' ||
    ctx.request.method === 'HEAD' ||
    ctx.request.method === 'OPTIONS'
  ) {
    return;
  }
  if (EXEMPT_PREFIXES.some((prefix) => ctx.path.startsWith(prefix))) return;
  if (ctx.path === EXEMPT_EXACT) return;

  const header = ctx.request.headers.get('X-CSRF-Token');
  const cookieValue = ctx.cookie._csrf?.value;
  if (header === null || header === '' || header !== cookieValue || !validCsrfToken(header)) {
    throw new ApiError(403, 'Invalid CSRF token');
  }
}

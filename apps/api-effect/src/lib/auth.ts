import type { User } from '../generated/prisma/client';
import { ApiError } from './errors';
import { verifyToken } from './jwt';
import type { Ctx } from './http';

export interface AuthResult {
  user: User;
  sessionId: string | null;
}

export function extractToken(ctx: Ctx): string | null {
  const cookieToken = ctx.cookies.access_token;
  if (typeof cookieToken === 'string' && cookieToken !== '') {
    return cookieToken;
  }
  const authorization = ctx.http.headers.get('authorization');
  if (authorization !== null && authorization.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length);
  }
  return null;
}

async function authenticate(ctx: Ctx): Promise<AuthResult> {
  const token = extractToken(ctx);
  if (token === null) throw new ApiError(401, 'Unauthorized');
  const claims = await verifyToken(process.env.JWT_SECRET_KEY ?? '', token);
  if (claims === null) throw new ApiError(401, 'Unauthorized');
  const user = await ctx.db.user.findUnique({ where: { id: claims.sub } });
  if (user === null) throw new ApiError(401, 'User not found');
  return { user, sessionId: claims.jti ?? null };
}

export function requireAuth(ctx: Ctx): Promise<AuthResult> {
  return authenticate(ctx);
}

export async function optionalAuth(ctx: Ctx): Promise<AuthResult | null> {
  try {
    return await authenticate(ctx);
  } catch {
    return null;
  }
}

export async function requireAdmin(ctx: Ctx): Promise<AuthResult> {
  const auth = await authenticate(ctx);
  if (auth.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Forbidden resource');
  }
  return auth;
}

const AUTH_COOKIE_BASE = { httpOnly: true, path: '/', sameSite: 'lax' } as const;

export function setAuthCookies(
  ctx: Ctx,
  accessToken: string,
  refreshToken: string,
  refreshTtlSeconds: number,
): void {
  const secure = process.env.NODE_ENV === 'production';
  ctx.setCookie('access_token', accessToken, {
    ...AUTH_COOKIE_BASE,
    maxAge: 900,
    secure,
  });
  ctx.setCookie('refresh_token', refreshToken, {
    ...AUTH_COOKIE_BASE,
    maxAge: refreshTtlSeconds,
    secure,
  });
}

export function clearAuthCookies(ctx: Ctx): void {
  for (const name of ['access_token', 'refresh_token']) {
    ctx.setCookie(name, '', { ...AUTH_COOKIE_BASE, maxAge: 0 });
  }
}

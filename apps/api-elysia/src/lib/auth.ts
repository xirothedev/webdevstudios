import type { User } from '../generated/prisma/client';
import { ApiError } from './errors';
import { verifyToken } from './jwt';
import { db } from './prisma';

type CookieSlot = {
  value?: unknown;
  httpOnly?: boolean;
  path?: string;
  sameSite?: 'strict' | 'lax' | 'none' | boolean;
  maxAge?: number;
  secure?: boolean;
};

export type AuthContext = {
  request: Request;
  cookie: Record<string, CookieSlot>;
};

export interface AuthResult {
  user: User;
  sessionId: string | null;
}

export function extractToken(ctx: AuthContext): string | null {
  const cookieToken = ctx.cookie.access_token?.value;
  if (typeof cookieToken === 'string' && cookieToken !== '') {
    return cookieToken;
  }
  const authorization = ctx.request.headers.get('authorization');
  if (authorization !== null && authorization.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length);
  }
  return null;
}

async function authenticate(ctx: AuthContext): Promise<AuthResult> {
  const token = extractToken(ctx);
  if (token === null) throw new ApiError(401, 'Unauthorized');
  const claims = await verifyToken(process.env.JWT_SECRET_KEY ?? '', token);
  if (claims === null) throw new ApiError(401, 'Unauthorized');
  const user = await db().user.findUnique({ where: { id: claims.sub } });
  if (user === null) throw new ApiError(401, 'User not found');
  return { user, sessionId: claims.jti ?? null };
}

export function requireAuth(ctx: AuthContext): Promise<AuthResult> {
  return authenticate(ctx);
}

export async function optionalAuth(ctx: AuthContext): Promise<AuthResult | null> {
  try {
    return await authenticate(ctx);
  } catch {
    return null;
  }
}

export async function requireAdmin(ctx: AuthContext): Promise<AuthResult> {
  const auth = await authenticate(ctx);
  if (auth.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Forbidden resource');
  }
  return auth;
}

export function setAuthCookies(
  cookie: Record<string, CookieSlot>,
  accessToken: string,
  refreshToken: string,
  refreshTtlSeconds: number,
): void {
  const secure = process.env.NODE_ENV === 'production';
  const access = cookie.access_token;
  access.value = accessToken;
  access.httpOnly = true;
  access.path = '/';
  access.sameSite = 'lax';
  access.maxAge = 900;
  access.secure = secure;

  const refresh = cookie.refresh_token;
  refresh.value = refreshToken;
  refresh.httpOnly = true;
  refresh.path = '/';
  refresh.sameSite = 'lax';
  refresh.maxAge = refreshTtlSeconds;
  refresh.secure = secure;
}

export function clearAuthCookies(cookie: Record<string, CookieSlot>): void {
  for (const name of ['access_token', 'refresh_token']) {
    const slot = cookie[name];
    slot.value = '';
    slot.maxAge = 0;
    slot.path = '/';
    slot.httpOnly = true;
    slot.sameSite = 'lax';
  }
}

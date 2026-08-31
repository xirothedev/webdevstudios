import { Elysia } from 'elysia';

import {
  enable2fa,
  loginUser,
  logoutUser,
  listSessions,
  registerUser,
  refreshSession,
  requestPasswordReset,
  resetPassword,
  verify2fa,
  verifyEmail,
  type LoginInput,
  type RegisterInput,
} from '../lib/auth-logic';
import { db } from '../lib/prisma';
import { ApiError } from '../lib/errors';
import { clientIp } from '../lib/throttle';
import { bindBody, bindJson } from '../lib/validate';
import { clearAuthCookies, requireAuth, setAuthCookies } from '../lib/auth';

export const auth = new Elysia()
  .post('/auth/register', async ({ request, set }) => {
    const in1 = await bindJson<RegisterInput>(
      { request },
      {
        Email: { type: 'string', required: true, email: true },
        Password: { type: 'string', required: true, minLen: 8 },
        FullName: { type: 'string', required: true },
        Phone: { type: 'string' },
      },
    );
    const res = await registerUser(db(), in1);
    set.status = 201;
    return res;
  })
  .post('/auth/login', async ({ request, cookie }) => {
    const in1 = await bindJson<LoginInput>(
      { request },
      {
        Email: { type: 'string', required: true, email: true },
        Password: { type: 'string', required: true },
        RememberMe: { type: 'boolean' },
      },
    );
    const result = await loginUser(db(), in1, {
      userAgent: request.headers.get('user-agent') ?? '',
      ip: clientIp(request),
    });
    if (result.requires2FA) {
      return { user: result.user, requires2FA: true };
    }
    setAuthCookies(cookie, result.accessToken, result.refreshToken, result.ttlSeconds);
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      ttlSeconds: result.ttlSeconds,
      user: result.user,
    };
  })
  .post('/auth/refresh', async ({ request, cookie }) => {
    let refreshToken = '';
    const rawText = await request.text();
    if (rawText.trim() !== '') {
      try {
        const parsed = JSON.parse(rawText) as { refreshToken?: unknown };
        if (typeof parsed.refreshToken === 'string') refreshToken = parsed.refreshToken;
      } catch {
        // mirrors Go: ShouldBindJSON errors ignored
      }
    }
    if (refreshToken === '') {
      const cookieValue = cookie.refresh_token?.value;
      if (typeof cookieValue === 'string' && cookieValue !== '') refreshToken = cookieValue;
    }
    const res = await refreshSession(db(), refreshToken);
    setAuthCookies(cookie, res.accessToken, res.refreshToken, res.ttlSeconds);
    return res;
  })
  .post('/auth/logout', async ({ request, cookie }) => {
    const authResult = await requireAuth({ request, cookie });
    await logoutUser(db(), authResult.user.id, authResult.sessionId);
    clearAuthCookies(cookie);
    return { success: true };
  })
  .get('/auth/sessions', async ({ request, cookie }) => {
    const authResult = await requireAuth({ request, cookie });
    return listSessions(db(), authResult.user.id);
  })
  .get('/auth/verify-email', async ({ query }) => {
    const token = query.token;
    if (!token) throw new ApiError(400, 'token is required');
    await verifyEmail(db(), token);
    return { success: true };
  })
  .post('/auth/password/reset-request', async ({ request }) => {
    const in1 = await bindJson<{ email?: string }>(
      { request },
      {
        Email: { type: 'string', required: true, email: true },
      },
    );
    await requestPasswordReset(db(), in1.email!);
    return { success: true };
  })
  .post('/auth/password/reset', async ({ request }) => {
    const in1 = await bindJson<{ token?: string; newPassword?: string }>(
      { request },
      {
        Token: { type: 'string', required: true },
        NewPassword: { type: 'string', required: true, minLen: 8 },
      },
    );
    await resetPassword(db(), in1.token!, in1.newPassword!);
    return { success: true };
  })
  .post('/auth/2fa/enable', async ({ request, cookie }) => {
    const authResult = await requireAuth({ request, cookie });
    return enable2fa(db(), authResult.user);
  })
  .post('/auth/2fa/verify', async ({ request, cookie, body }) => {
    const authResult = await requireAuth({ request, cookie });
    const in1 = bindBody<{ code?: string }>(body as Record<string, unknown>, {
      Code: { type: 'string', required: true },
    });
    await verify2fa(db(), authResult.user.id, authResult.sessionId, in1.code!);
    return { success: true };
  })
  .get('/auth/oauth/google', () => {
    throw new ApiError(
      501,
      'OAuth google requires GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET and callback wiring (deferred)',
    );
  })
  .get('/auth/oauth/google/callback', () => {
    throw new ApiError(
      501,
      'OAuth google requires GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET and callback wiring (deferred)',
    );
  })
  .get('/auth/oauth/github', () => {
    throw new ApiError(
      501,
      'OAuth github requires GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET and callback wiring (deferred)',
    );
  })
  .get('/auth/oauth/github/callback', () => {
    throw new ApiError(
      501,
      'OAuth github requires GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET and callback wiring (deferred)',
    );
  });

export default auth;

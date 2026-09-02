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
import { route, bodyOf } from '../lib/http';

const OAUTH_DEFERRED = (provider: 'google' | 'github') =>
  new ApiError(
    501,
    `OAuth ${provider} requires ${provider.toUpperCase()}_CLIENT_ID / ${provider.toUpperCase()}_CLIENT_SECRET and callback wiring (deferred)`,
  );

export const authRoutes = [
  route('POST', '/auth/register', async (ctx) => {
    const in1 = await bindJson<RegisterInput>(
      { request: ctx.http },
      {
        Email: { type: 'string', required: true, email: true },
        Password: { type: 'string', required: true, minLen: 8 },
        FullName: { type: 'string', required: true },
        Phone: { type: 'string' },
      },
    );
    const res = await registerUser(db(), in1);
    ctx.status = 201;
    return res;
  }),
  route('POST', '/auth/login', async (ctx) => {
    const in1 = await bindJson<LoginInput>(
      { request: ctx.http },
      {
        Email: { type: 'string', required: true, email: true },
        Password: { type: 'string', required: true },
        RememberMe: { type: 'boolean' },
      },
    );
    const result = await loginUser(db(), in1, {
      userAgent: ctx.http.headers.get('user-agent') ?? '',
      ip: clientIp(ctx.http),
    });
    if (result.requires2FA) {
      return { user: result.user, requires2FA: true };
    }
    setAuthCookies(ctx, result.accessToken, result.refreshToken, result.ttlSeconds);
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      ttlSeconds: result.ttlSeconds,
      user: result.user,
    };
  }),
  route('POST', '/auth/refresh', async (ctx) => {
    let refreshToken = '';
    const rawText = await ctx.http.text();
    if (rawText.trim() !== '') {
      try {
        const parsed = JSON.parse(rawText) as { refreshToken?: unknown };
        if (typeof parsed.refreshToken === 'string') refreshToken = parsed.refreshToken;
      } catch {
        // mirrors Go: ShouldBindJSON errors ignored
      }
    }
    if (refreshToken === '') {
      const cookieValue = ctx.cookies.refresh_token;
      if (typeof cookieValue === 'string' && cookieValue !== '') refreshToken = cookieValue;
    }
    const res = await refreshSession(db(), refreshToken);
    setAuthCookies(ctx, res.accessToken, res.refreshToken, res.ttlSeconds);
    return res;
  }),
  route('POST', '/auth/logout', async (ctx) => {
    const authResult = await requireAuth(ctx);
    await logoutUser(db(), authResult.user.id, authResult.sessionId);
    clearAuthCookies(ctx);
    return { success: true };
  }),
  route('GET', '/auth/sessions', async (ctx) => {
    const authResult = await requireAuth(ctx);
    return listSessions(db(), authResult.user.id);
  }),
  route('GET', '/auth/verify-email', async (ctx) => {
    const token = ctx.query.token;
    if (!token) throw new ApiError(400, 'token is required');
    await verifyEmail(db(), token);
    return { success: true };
  }),
  route('POST', '/auth/password/reset-request', async (ctx) => {
    const in1 = await bindJson<{ email?: string }>(
      { request: ctx.http },
      {
        Email: { type: 'string', required: true, email: true },
      },
    );
    await requestPasswordReset(db(), in1.email!);
    return { success: true };
  }),
  route('POST', '/auth/password/reset', async (ctx) => {
    const in1 = await bindJson<{ token?: string; newPassword?: string }>(
      { request: ctx.http },
      {
        Token: { type: 'string', required: true },
        NewPassword: { type: 'string', required: true, minLen: 8 },
      },
    );
    await resetPassword(db(), in1.token!, in1.newPassword!);
    return { success: true };
  }),
  route('POST', '/auth/2fa/enable', async (ctx) => {
    const authResult = await requireAuth(ctx);
    return enable2fa(db(), authResult.user);
  }),
  route('POST', '/auth/2fa/verify', async (ctx) => {
    const authResult = await requireAuth(ctx);
    const in1 = bindBody<{ code?: string }>(await bodyOf(ctx), {
      Code: { type: 'string', required: true },
    });
    await verify2fa(db(), authResult.user.id, authResult.sessionId, in1.code!);
    return { success: true };
  }),
  route('GET', '/auth/oauth/google', async () => {
    throw OAUTH_DEFERRED('google');
  }),
  route('GET', '/auth/oauth/google/callback', async () => {
    throw OAUTH_DEFERRED('google');
  }),
  route('GET', '/auth/oauth/github', async () => {
    throw OAUTH_DEFERRED('github');
  }),
  route('GET', '/auth/oauth/github/callback', async () => {
    throw OAUTH_DEFERRED('github');
  }),
];

import { HttpApiBuilder } from 'effect/unstable/httpapi';

import { api } from '../api';
import { wrap, bodyOf } from '../lib/http';
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
import { ApiError } from '../lib/errors';
import { clientIp } from '../lib/throttle';
import { bindBody, bindJson } from '../lib/validate';
import { clearAuthCookies, requireAuth, setAuthCookies } from '../lib/auth';

const OAUTH_DEFERRED = (provider: 'google' | 'github') =>
  new ApiError(
    501,
    `OAuth ${provider} requires ${provider.toUpperCase()}_CLIENT_ID / ${provider.toUpperCase()}_CLIENT_SECRET and callback wiring (deferred)`,
  );

export const authHandlers = HttpApiBuilder.group(api, 'auth', (h) =>
  h
    .handle(
      'register',
      wrap(true, async (ctx) => {
        const in1 = await bindJson<RegisterInput>(
          { request: ctx.http },
          {
            Email: { type: 'string', required: true, email: true },
            Password: { type: 'string', required: true, minLen: 8 },
            FullName: { type: 'string', required: true },
            Phone: { type: 'string' },
          },
        );
        const res = await registerUser(ctx.db, in1);
        ctx.status = 201;
        return res;
      }),
    )
    .handle(
      'login',
      wrap(true, async (ctx) => {
        const in1 = await bindJson<LoginInput>(
          { request: ctx.http },
          {
            Email: { type: 'string', required: true, email: true },
            Password: { type: 'string', required: true },
            RememberMe: { type: 'boolean' },
          },
        );
        const result = await loginUser(ctx.db, in1, {
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
    )
    .handle(
      'refresh',
      wrap(true, async (ctx) => {
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
        const res = await refreshSession(ctx.db, refreshToken);
        setAuthCookies(ctx, res.accessToken, res.refreshToken, res.ttlSeconds);
        return res;
      }),
    )
    .handle(
      'logout',
      wrap(true, async (ctx) => {
        const authResult = await requireAuth(ctx);
        await logoutUser(ctx.db, authResult.user.id, authResult.sessionId);
        clearAuthCookies(ctx);
        return { success: true };
      }),
    )
    .handle(
      'sessions',
      wrap(true, async (ctx) => {
        const authResult = await requireAuth(ctx);
        return listSessions(ctx.db, authResult.user.id);
      }),
    )
    .handle(
      'verifyEmail',
      wrap(true, async (ctx) => {
        const token = ctx.query.token;
        if (!token) throw new ApiError(400, 'token is required');
        await verifyEmail(ctx.db, token);
        return { success: true };
      }),
    )
    .handle(
      'resetRequest',
      wrap(true, async (ctx) => {
        const in1 = await bindJson<{ email?: string }>(
          { request: ctx.http },
          {
            Email: { type: 'string', required: true, email: true },
          },
        );
        await requestPasswordReset(ctx.db, in1.email!);
        return { success: true };
      }),
    )
    .handle(
      'reset',
      wrap(true, async (ctx) => {
        const in1 = await bindJson<{ token?: string; newPassword?: string }>(
          { request: ctx.http },
          {
            Token: { type: 'string', required: true },
            NewPassword: { type: 'string', required: true, minLen: 8 },
          },
        );
        await resetPassword(ctx.db, in1.token!, in1.newPassword!);
        return { success: true };
      }),
    )
    .handle(
      'enable2fa',
      wrap(true, async (ctx) => {
        const authResult = await requireAuth(ctx);
        return enable2fa(ctx.db, authResult.user);
      }),
    )
    .handle(
      'verify2fa',
      wrap(true, async (ctx) => {
        const authResult = await requireAuth(ctx);
        const in1 = bindBody<{ code?: string }>(await bodyOf(ctx), {
          Code: { type: 'string', required: true },
        });
        await verify2fa(ctx.db, authResult.user.id, authResult.sessionId, in1.code!);
        return { success: true };
      }),
    )
    .handle(
      'oauthGoogle',
      wrap(true, async () => {
        throw OAUTH_DEFERRED('google');
      }),
    )
    .handle(
      'oauthGoogleCallback',
      wrap(true, async () => {
        throw OAUTH_DEFERRED('google');
      }),
    )
    .handle(
      'oauthGithub',
      wrap(true, async () => {
        throw OAUTH_DEFERRED('github');
      }),
    )
    .handle(
      'oauthGithubCallback',
      wrap(true, async () => {
        throw OAUTH_DEFERRED('github');
      }),
    ),
);

import { Schema } from 'effect';
import {
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
} from 'effect/unstable/httpapi';

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
} from '../lib/auth-logic';
import { ApiError } from '../lib/errors';
import { clientIp } from '../lib/throttle';
import { bindBody, bindJson } from '../lib/validate';
import { clearAuthCookies, requireAuth, setAuthCookies } from '../lib/auth';

const Str = Schema.String;
const Opt = Schema.NullOr;

const Brief = Schema.Struct({
  id: Str,
  email: Str,
  fullName: Opt(Str),
  emailVerified: Schema.Boolean,
  mfaEnabled: Schema.Boolean,
});

const Success = Schema.Struct({ success: Schema.Boolean });

const NestError = Schema.Struct({
  statusCode: Schema.Number,
  message: Schema.Union([Str, Schema.Array(Str)]),
  error: Str,
});

const RegisterResult = Schema.Struct({ userId: Str });

const LoginResult = Schema.Union([
  Schema.Struct({ user: Brief, requires2FA: Schema.Boolean }),
  Schema.Struct({ accessToken: Str, refreshToken: Str, ttlSeconds: Schema.Number, user: Brief }),
]);

const RefreshResult = Schema.Struct({
  accessToken: Str,
  refreshToken: Str,
  ttlSeconds: Schema.Number,
});

const SessionDto = Schema.Struct({
  id: Str,
  device: Opt(
    Schema.Struct({
      id: Str,
      name: Opt(Str),
      type: Str,
      lastSeenAt: Opt(Str),
    }),
  ),
  ipAddress: Opt(Str),
  userAgent: Opt(Str),
  status: Str,
  createdAt: Opt(Str),
  expiresAt: Opt(Str),
});

const Enable2faResult = Schema.Struct({
  qrCode: Str,
  secret: Str,
  backupCodes: Schema.Array(Str),
});

export const authGroup = HttpApiGroup.make('auth').add(
  HttpApiEndpoint.post('register', '/v1/auth/register', {
    success: [RegisterResult, HttpApiSchema.Created],
  }),
  HttpApiEndpoint.post('login', '/v1/auth/login', { success: LoginResult }),
  HttpApiEndpoint.post('refresh', '/v1/auth/refresh', { success: RefreshResult }),
  HttpApiEndpoint.post('logout', '/v1/auth/logout', { success: Success }),
  HttpApiEndpoint.get('sessions', '/v1/auth/sessions', { success: Schema.Array(SessionDto) }),
  HttpApiEndpoint.get('verifyEmail', '/v1/auth/verify-email', { success: Success }),
  HttpApiEndpoint.post('resetRequest', '/v1/auth/password/reset-request', { success: Success }),
  HttpApiEndpoint.post('reset', '/v1/auth/password/reset', { success: Success }),
  HttpApiEndpoint.post('enable2fa', '/v1/auth/2fa/enable', { success: Enable2faResult }),
  HttpApiEndpoint.post('verify2fa', '/v1/auth/2fa/verify', { success: Success }),
  // The four OAuth stubs only ever answer 501; their declared success is the
  // Nest error body itself.
  HttpApiEndpoint.get('oauthGoogle', '/v1/auth/oauth/google', { success: NestError }),
  HttpApiEndpoint.get('oauthGoogleCallback', '/v1/auth/oauth/google/callback', {
    success: NestError,
  }),
  HttpApiEndpoint.get('oauthGithub', '/v1/auth/oauth/github', { success: NestError }),
  HttpApiEndpoint.get('oauthGithubCallback', '/v1/auth/oauth/github/callback', {
    success: NestError,
  }),
);

export const authLocal = HttpApi.make('api-effect').add(authGroup);

const OAUTH_DEFERRED = (provider: 'google' | 'github') =>
  new ApiError(
    501,
    `OAuth ${provider} requires ${provider.toUpperCase()}_CLIENT_ID / ${provider.toUpperCase()}_CLIENT_SECRET and callback wiring (deferred)`,
  );

export const authHandlers = HttpApiBuilder.group(authLocal, 'auth', (h) =>
  h
    .handle(
      'register',
      wrap(true, async (ctx) => {
        const in1 = await bindJson(
          { request: ctx.http },
          {
            Email: { type: 'string', required: true, email: true },
            Password: { type: 'string', required: true, minLen: 8 },
            FullName: { type: 'string', required: true },
            Phone: { type: 'string' },
          },
        );
        const res = await registerUser(ctx.db, {
          ...in1,
          phone: in1.phone ?? undefined,
        });
        ctx.setStatus(201);
        return res;
      }),
    )
    .handle(
      'login',
      wrap(true, async (ctx) => {
        const in1 = await bindJson(
          { request: ctx.http },
          {
            Email: { type: 'string', required: true, email: true },
            Password: { type: 'string', required: true },
            RememberMe: { type: 'boolean' },
          },
        );
        const result = await loginUser(
          ctx.db,
          { ...in1, rememberMe: in1.rememberMe ?? false },
          {
            userAgent: ctx.http.headers.get('user-agent') ?? '',
            ip: clientIp(ctx.http),
          },
        );
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
            const parsed: { refreshToken?: unknown } = JSON.parse(rawText);
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
        return await listSessions(ctx.db, authResult.user.id);
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
        const in1 = await bindJson(
          { request: ctx.http },
          {
            Email: { type: 'string', required: true, email: true },
          },
        );
        await requestPasswordReset(ctx.db, in1.email);
        return { success: true };
      }),
    )
    .handle(
      'reset',
      wrap(true, async (ctx) => {
        const in1 = await bindJson(
          { request: ctx.http },
          {
            Token: { type: 'string', required: true },
            NewPassword: { type: 'string', required: true, minLen: 8 },
          },
        );
        await resetPassword(ctx.db, in1.token, in1.newPassword);
        return { success: true };
      }),
    )
    .handle(
      'enable2fa',
      wrap(true, async (ctx) => {
        const authResult = await requireAuth(ctx);
        return await enable2fa(ctx.db, authResult.user);
      }),
    )
    .handle(
      'verify2fa',
      wrap(true, async (ctx) => {
        const authResult = await requireAuth(ctx);
        const in1 = bindBody(await bodyOf(ctx), {
          Code: { type: 'string', required: true },
        });
        await verify2fa(ctx.db, authResult.user.id, authResult.sessionId, in1.code);
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

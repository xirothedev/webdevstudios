import { Elysia } from 'elysia';
import type { DeviceType, User } from '../generated/prisma/client';
import { ApiError } from '../lib/errors';
import { db } from '../lib/prisma';
import { getRedis } from '../lib/redis';
import { hashPassword, verifyPassword } from '../lib/password';
import { signAccess, signRefresh, verifyToken } from '../lib/jwt';
import { clearAuthCookies, requireAuth, setAuthCookies } from '../lib/auth';
import { mailEnabled, sendPasswordResetEmail, sendVerificationEmail } from '../lib/mailer';
import {
  generateBackupCodes,
  generateTotpSecret,
  otpauthUrl,
  toQrDataUrl,
  verifyTotp,
} from '../lib/totp';
import { goTime, newId, newUuid, randomHex, safeEqual, sha256Hex } from '../lib/util';
import { clientIp } from '../lib/throttle';
import { bindBody, bindJson } from '../lib/validate';

const JWT_SECRET = () => process.env.JWT_SECRET_KEY ?? '';

const DAY_SECONDS = 86_400;
const ACCESS_TTL_SECONDS = 900;
const REFRESH_TTL_DAYS = 7;

function brief(u: User) {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    emailVerified: u.emailVerified,
    mfaEnabled: u.mfaEnabled,
  };
}

async function redisSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  const rdb = await getRedis();
  if (rdb === null) return;
  await rdb.set(key, value, 'EX', ttlSeconds).catch(() => {});
}

// ponytail: mirrors Go provisionDevice; ContainsAny(char-set) quirk = /Mobile/ substring test.
async function provisionDevice(
  userId: string,
  ip: string,
  userAgent: string,
): Promise<string | null> {
  if (userAgent === '') return null;
  let kind: DeviceType = 'DESKTOP';
  if (userAgent.includes('iPad') || userAgent.includes('Tablet')) kind = 'TABLET';
  else if (/Mobile/.test(userAgent)) kind = 'MOBILE';
  const name = userAgent.slice(0, 255);
  const fingerprint = sha256Hex(`${userAgent}|${ip}`).slice(0, 32);
  try {
    const device = await db().device.create({
      data: {
        id: newId(),
        userId,
        name,
        type: kind,
        userAgent,
        ipAddress: ip || null,
        fingerprint,
      },
    });
    return device.id;
  } catch {
    return null;
  }
}

export const auth = new Elysia()
  .post('/auth/register', async ({ request, set }) => {
    const in1 = await bindJson<{
      email?: string;
      password?: string;
      fullName?: string;
      phone?: string | null;
    }>(
      { request },
      {
        Email: { type: 'string', required: true, email: true },
        Password: { type: 'string', required: true, minLen: 8 },
        FullName: { type: 'string', required: true },
        Phone: { type: 'string' },
      },
    );
    const existing = await db().user.findUnique({ where: { email: in1.email! } });
    if (existing !== null) {
      throw new ApiError(409, 'User with this email already exists');
    }
    const password = await hashPassword(in1.password!);
    const user = await db().user.create({
      data: {
        id: newUuid(),
        email: in1.email!,
        password,
        fullName: in1.fullName!,
        phone: in1.phone ?? null,
        role: 'CUSTOMER',
        emailVerified: false,
      },
    });
    const token = randomHex(32);
    if (mailEnabled()) {
      await sendVerificationEmail(user.email, token).catch((e: Error) => {
        console.error(`auth: verification mail failed for ${user.email}: ${e.message}`);
      });
    } else {
      console.log(
        `[dev] mailer disabled; verification link for ${user.email}: /v1/auth/verify-email?token=${token}`,
      );
    }
    await redisSet(`emailverify:${token}`, user.id, DAY_SECONDS);
    set.status = 201;
    return { userId: user.id };
  })
  .post('/auth/login', async ({ request, cookie }) => {
    const in1 = await bindJson<{
      email?: string;
      password?: string;
      rememberMe?: boolean;
    }>(
      { request },
      {
        Email: { type: 'string', required: true, email: true },
        Password: { type: 'string', required: true },
        RememberMe: { type: 'boolean' },
      },
    );
    const user = await db().user.findUnique({ where: { email: in1.email! } });
    if (user === null || user.password === null) {
      throw new ApiError(401, 'Invalid credentials');
    }
    if (!(await verifyPassword(user.password, in1.password!))) {
      throw new ApiError(401, 'Invalid credentials');
    }
    if (!user.emailVerified) {
      throw new ApiError(400, 'Please verify your email before logging in');
    }
    if (user.mfaEnabled) {
      return { user: brief(user), requires2FA: true };
    }
    const ttlSeconds = in1.rememberMe ? 30 * DAY_SECONDS : REFRESH_TTL_DAYS * DAY_SECONDS;
    const sessionId = newUuid();
    const accessToken = await signAccess(
      JWT_SECRET(),
      user.id,
      user.email,
      user.role,
      sessionId,
      ACCESS_TTL_SECONDS,
    );
    const refreshToken = await signRefresh(JWT_SECRET(), user.id, ttlSeconds);
    const userAgent = request.headers.get('user-agent') ?? '';
    const ip = clientIp(request);
    const deviceId = await provisionDevice(user.id, ip, userAgent);
    await db().session.create({
      data: {
        id: sessionId,
        token: accessToken,
        refreshToken,
        userId: user.id,
        deviceId,
        ipAddress: ip || null,
        userAgent: userAgent || null,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + ttlSeconds * 1000),
      },
    });
    setAuthCookies(cookie, accessToken, refreshToken, ttlSeconds);
    return {
      accessToken,
      refreshToken,
      ttlSeconds,
      user: brief(user),
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
    if (refreshToken === '') throw new ApiError(401, 'Invalid refresh token');

    const claims = await verifyToken(JWT_SECRET(), refreshToken);
    if (claims === null) throw new ApiError(401, 'Invalid or expired session');
    const session = await db().session.findUnique({ where: { refreshToken } });
    if (session === null || session.status !== 'ACTIVE') {
      throw new ApiError(401, 'Invalid or expired session');
    }
    if (new Date() > session.expiresAt) {
      throw new ApiError(401, 'Session expired');
    }
    const user = await db().user.findUnique({ where: { id: session.userId } });
    if (user === null) throw new ApiError(401, 'User not found');

    const ttlSeconds = Math.max(0, Math.trunc((session.expiresAt.getTime() - Date.now()) / 1000));
    const newAccess = await signAccess(
      JWT_SECRET(),
      claims.sub,
      user.email,
      user.role,
      session.id,
      ACCESS_TTL_SECONDS,
    );
    const newRefresh = await signRefresh(JWT_SECRET(), claims.sub, REFRESH_TTL_DAYS * DAY_SECONDS);
    await db().session.update({ where: { id: session.id }, data: { refreshToken: newRefresh } });
    setAuthCookies(cookie, newAccess, newRefresh, ttlSeconds);
    return { accessToken: newAccess, refreshToken: newRefresh, ttlSeconds };
  })
  .post('/auth/logout', async ({ request, cookie }) => {
    const authResult = await requireAuth({ request, cookie });
    const now = new Date();
    if (authResult.sessionId !== null) {
      await db().session.updateMany({
        where: { id: authResult.sessionId },
        data: { status: 'REVOKED', revokedAt: now, updatedAt: now },
      });
    } else {
      await db().session.updateMany({
        where: { userId: authResult.user.id },
        data: { status: 'REVOKED', revokedAt: now, updatedAt: now },
      });
    }
    clearAuthCookies(cookie);
    return { success: true };
  })
  .get('/auth/sessions', async ({ request, cookie }) => {
    const authResult = await requireAuth({ request, cookie });
    const rows = await db().session.findMany({
      where: { userId: authResult.user.id },
      orderBy: { createdAt: 'desc' },
      include: { device: true },
    });
    return rows.map((r) => ({
      id: r.id,
      device:
        r.device === null
          ? null
          : {
              id: r.device.id,
              name: r.device.name,
              type: r.device.type,
              lastSeenAt: goTime(r.device.lastSeenAt),
            },
      ipAddress: r.ipAddress,
      userAgent: r.userAgent,
      status: r.status,
      createdAt: goTime(r.createdAt),
      expiresAt: goTime(r.expiresAt),
    }));
  })
  .get('/auth/verify-email', async ({ query }) => {
    const token = query.token;
    if (!token) throw new ApiError(400, 'token is required');
    try {
      const rdb = await getRedis();
      if (rdb === null) throw new ApiError(400, 'Invalid or expired verification token');
      const val = await rdb.get(`emailverify:${token}`);
      if (val === null) throw new ApiError(400, 'Invalid or expired verification token');
      await rdb.del(`emailverify:${token}`);
      await db().user.update({ where: { id: val }, data: { emailVerified: true } });
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(400, 'Invalid or expired verification token');
    }
    return { success: true };
  })
  .post('/auth/password/reset-request', async ({ request }) => {
    const in1 = await bindJson<{ email?: string }>(
      { request },
      {
        Email: { type: 'string', required: true, email: true },
      },
    );
    const user = await db().user.findUnique({ where: { email: in1.email! } });
    if (user === null) return { success: true };
    const token = randomHex(32);
    await redisSet(`passwordreset:${token}`, user.id, DAY_SECONDS);
    if (mailEnabled()) {
      await sendPasswordResetEmail(user.email, token);
    } else {
      console.log(
        `[dev] password reset token for ${user.email}: /v1/auth/password/reset?token=${token}`,
      );
    }
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
    try {
      const rdb = await getRedis();
      if (rdb === null) throw new ApiError(404, 'Invalid or expired reset token');
      const userId = await rdb.get(`passwordreset:${in1.token!}`);
      if (userId === null) throw new ApiError(404, 'Invalid or expired reset token');
      const hashed = await hashPassword(in1.newPassword!);
      const now = new Date();
      await db().$transaction(async (tx) => {
        await tx.user.update({ where: { id: userId }, data: { password: hashed } });
        await tx.session.updateMany({
          where: { userId },
          data: { status: 'REVOKED', revokedAt: now, updatedAt: now },
        });
      });
      await rdb.del(`passwordreset:${in1.token!}`);
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(404, 'Invalid or expired reset token');
    }
    return { success: true };
  })
  .post('/auth/2fa/enable', async ({ request, cookie }) => {
    const authResult = await requireAuth({ request, cookie });
    if (authResult.user.mfaEnabled) {
      throw new ApiError(400, '2FA is already enabled');
    }
    const secret = generateTotpSecret();
    const backupCodes = generateBackupCodes(10);
    const qrCode = await toQrDataUrl(otpauthUrl(authResult.user.email, secret));
    await db().$transaction(async (tx) => {
      await tx.userMFAMethod.create({
        data: {
          id: newId(),
          userId: authResult.user.id,
          methodType: 'TOTP',
          secret,
          isActive: false,
          isVerified: false,
        },
      });
      await tx.mFABackupCode.createMany({
        data: backupCodes.map((code) => ({
          id: newId(),
          userId: authResult.user.id,
          code,
        })),
      });
    });
    return { qrCode, secret, backupCodes };
  })
  .post('/auth/2fa/verify', async ({ request, cookie, body }) => {
    const authResult = await requireAuth({ request, cookie });
    const in1 = bindBody<{ code?: string }>(body as Record<string, unknown>, {
      Code: { type: 'string', required: true },
    });
    const code = in1.code!.trim().toUpperCase().replaceAll('-', '');
    const method = await db().userMFAMethod.findFirst({
      where: { userId: authResult.user.id, methodType: 'TOTP' },
      orderBy: { createdAt: 'desc' },
    });
    let valid = false;
    if (method !== null && method.secret !== null) {
      valid = verifyTotp(method.secret, code);
    }
    if (!valid) {
      const rows = await db().mFABackupCode.findMany({
        where: { userId: authResult.user.id, isUsed: false },
      });
      for (const row of rows) {
        if (safeEqual(row.code, code)) {
          await db().mFABackupCode.update({
            where: { id: row.id },
            data: { isUsed: true },
          });
          valid = true;
          break;
        }
      }
    }
    if (!valid) throw new ApiError(401, 'Invalid 2FA code');
    await db().userMFAMethod.updateMany({
      where: { userId: authResult.user.id, methodType: 'TOTP' },
      data: { isActive: true, isVerified: true },
    });
    await db().user.update({ where: { id: authResult.user.id }, data: { mfaEnabled: true } });
    if (authResult.sessionId !== null) {
      await redisSet(`mfaverified:${authResult.sessionId}`, '1', 7 * DAY_SECONDS);
    }
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

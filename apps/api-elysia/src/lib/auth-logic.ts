import type { DeviceType, User } from '../generated/prisma/client';
import { ApiError } from './errors';
import { getRedis } from './redis';
import { hashPassword, verifyPassword } from './password';
import { signAccess, signRefresh, verifyToken } from './jwt';
import { mailEnabled, sendPasswordResetEmail, sendVerificationEmail } from './mailer';
import {
  generateBackupCodes,
  generateTotpSecret,
  otpauthUrl,
  toQrDataUrl,
  verifyTotp,
} from './totp';
import { goTime, newId, newUuid, randomHex, safeEqual, sha256Hex } from './util';
import type { DatabaseClient } from './prisma';

const JWT_SECRET = () => process.env.JWT_SECRET_KEY ?? '';

const DAY_SECONDS = 86_400;
const ACCESS_TTL_SECONDS = 900;
const REFRESH_TTL_DAYS = 7;

export function brief(u: User) {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    emailVerified: u.emailVerified,
    mfaEnabled: u.mfaEnabled,
  };
}

export type UserBrief = ReturnType<typeof brief>;

async function redisSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  const rdb = await getRedis();
  if (rdb === null) return;
  await rdb.set(key, value, 'EX', ttlSeconds).catch((e: unknown) => {
    console.error('redis set failed:', e instanceof Error ? e.message : String(e));
  });
}

// ponytail: mirrors Go provisionDevice; ContainsAny(char-set) quirk = /Mobile/ substring test.
async function provisionDevice(
  db: DatabaseClient,
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
    const device = await db.device.create({
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

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
}

export async function registerUser(db: DatabaseClient, in1: RegisterInput) {
  const existing = await db.user.findUnique({ where: { email: in1.email } });
  if (existing !== null) {
    throw new ApiError(409, 'User with this email already exists');
  }
  const password = await hashPassword(in1.password);
  const user = await db.user.create({
    data: {
      id: newUuid(),
      email: in1.email,
      password,
      fullName: in1.fullName,
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
  } else if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[dev] mailer disabled; verification link for ${user.email}: /v1/auth/verify-email?token=${token}`,
    );
  }
  await redisSet(`emailverify:${token}`, user.id, DAY_SECONDS);
  return { userId: user.id };
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginMeta {
  userAgent: string;
  ip: string;
}

export type LoginResult =
  | { user: UserBrief; requires2FA: true }
  | {
      user: UserBrief;
      requires2FA: false;
      accessToken: string;
      refreshToken: string;
      ttlSeconds: number;
    };

export async function loginUser(
  db: DatabaseClient,
  in1: LoginInput,
  meta: LoginMeta,
): Promise<LoginResult> {
  const user = await db.user.findUnique({ where: { email: in1.email } });
  if (user === null || user.password === null) {
    throw new ApiError(401, 'Invalid credentials');
  }
  if (!(await verifyPassword(user.password, in1.password))) {
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
  const deviceId = await provisionDevice(db, user.id, meta.ip, meta.userAgent);
  await db.session.create({
    data: {
      id: sessionId,
      token: accessToken,
      refreshToken,
      userId: user.id,
      deviceId,
      ipAddress: meta.ip || null,
      userAgent: meta.userAgent || null,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
    },
  });
  return {
    accessToken,
    refreshToken,
    ttlSeconds,
    user: brief(user),
    requires2FA: false,
  };
}

export async function refreshSession(db: DatabaseClient, refreshToken: string) {
  if (refreshToken === '') throw new ApiError(401, 'Invalid refresh token');
  const claims = await verifyToken(JWT_SECRET(), refreshToken);
  if (claims === null) throw new ApiError(401, 'Invalid or expired session');
  const session = await db.session.findUnique({ where: { refreshToken } });
  if (session === null || session.status !== 'ACTIVE') {
    throw new ApiError(401, 'Invalid or expired session');
  }
  if (new Date() > session.expiresAt) {
    throw new ApiError(401, 'Session expired');
  }
  const user = await db.user.findUnique({ where: { id: session.userId } });
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
  await db.session.update({ where: { id: session.id }, data: { refreshToken: newRefresh } });
  return { accessToken: newAccess, refreshToken: newRefresh, ttlSeconds };
}

export async function logoutUser(
  db: DatabaseClient,
  userId: string,
  sessionId: string | null,
): Promise<void> {
  const now = new Date();
  if (sessionId !== null) {
    await db.session.updateMany({
      where: { id: sessionId },
      data: { status: 'REVOKED', revokedAt: now, updatedAt: now },
    });
  } else {
    await db.session.updateMany({
      where: { userId },
      data: { status: 'REVOKED', revokedAt: now, updatedAt: now },
    });
  }
}

export async function listSessions(db: DatabaseClient, userId: string) {
  const rows = await db.session.findMany({
    where: { userId },
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
}

export async function verifyEmail(db: DatabaseClient, token: string): Promise<void> {
  try {
    const rdb = await getRedis();
    if (rdb === null) throw new ApiError(400, 'Invalid or expired verification token');
    const val = await rdb.get(`emailverify:${token}`);
    if (val === null) throw new ApiError(400, 'Invalid or expired verification token');
    await rdb.del(`emailverify:${token}`);
    await db.user.update({ where: { id: val }, data: { emailVerified: true } });
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(400, 'Invalid or expired verification token');
  }
}

export async function requestPasswordReset(db: DatabaseClient, email: string): Promise<void> {
  const user = await db.user.findUnique({ where: { email } });
  if (user === null) return;
  const token = randomHex(32);
  await redisSet(`passwordreset:${token}`, user.id, DAY_SECONDS);
  if (mailEnabled()) {
    await sendPasswordResetEmail(user.email, token);
  } else if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[dev] password reset token for ${user.email}: /v1/auth/password/reset?token=${token}`,
    );
  }
}

export async function resetPassword(
  db: DatabaseClient,
  token: string,
  newPassword: string,
): Promise<void> {
  try {
    const rdb = await getRedis();
    if (rdb === null) throw new ApiError(404, 'Invalid or expired reset token');
    const userId = await rdb.get(`passwordreset:${token}`);
    if (userId === null) throw new ApiError(404, 'Invalid or expired reset token');
    const hashed = await hashPassword(newPassword);
    const now = new Date();
    await db.$transaction(async (tx) => {
      await tx.user.update({ where: { id: userId }, data: { password: hashed } });
      await tx.session.updateMany({
        where: { userId },
        data: { status: 'REVOKED', revokedAt: now, updatedAt: now },
      });
    });
    await rdb.del(`passwordreset:${token}`);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(404, 'Invalid or expired reset token');
  }
}

export async function enable2fa(db: DatabaseClient, user: User) {
  if (user.mfaEnabled) {
    throw new ApiError(400, '2FA is already enabled');
  }
  const secret = generateTotpSecret();
  const backupCodes = generateBackupCodes(10);
  const qrCode = await toQrDataUrl(otpauthUrl(user.email, secret));
  await db.$transaction(async (tx) => {
    await tx.userMFAMethod.create({
      data: {
        id: newId(),
        userId: user.id,
        methodType: 'TOTP',
        secret,
        isActive: false,
        isVerified: false,
      },
    });
    await tx.mFABackupCode.createMany({
      data: backupCodes.map((code) => ({
        id: newId(),
        userId: user.id,
        code,
      })),
    });
  });
  return { qrCode, secret, backupCodes };
}

export async function verify2fa(
  db: DatabaseClient,
  userId: string,
  sessionId: string | null,
  code: string,
): Promise<void> {
  const normalized = code.trim().toUpperCase().replaceAll('-', '');
  const method = await db.userMFAMethod.findFirst({
    where: { userId, methodType: 'TOTP' },
    orderBy: { createdAt: 'desc' },
  });
  let valid = false;
  if (method !== null && method.secret !== null) {
    valid = verifyTotp(method.secret, normalized);
  }
  if (!valid) {
    const rows = await db.mFABackupCode.findMany({
      where: { userId, isUsed: false },
    });
    for (const row of rows) {
      if (safeEqual(row.code, normalized)) {
        await db.mFABackupCode.update({
          where: { id: row.id },
          data: { isUsed: true },
        });
        valid = true;
        break;
      }
    }
  }
  if (!valid) throw new ApiError(401, 'Invalid 2FA code');
  await db.userMFAMethod.updateMany({
    where: { userId, methodType: 'TOTP' },
    data: { isActive: true, isVerified: true },
  });
  await db.user.update({ where: { id: userId }, data: { mfaEnabled: true } });
  if (sessionId !== null) {
    await redisSet(`mfaverified:${sessionId}`, '1', 7 * DAY_SECONDS);
  }
}

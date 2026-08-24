import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { describe, expect, test } from 'bun:test';
import * as argon2 from 'argon2';

import { UserRepo } from '@/users/repo';

import { SessionRepo } from '../repo';
import { AuthService } from './auth.service';

// ponytail: hand-rolled fakes per repo-seam rule; swap for a builder if this file grows past ~150 lines
const baseUser = {
  id: 'user-1',
  email: 'user@example.com',
  fullName: 'Test User',
  phone: null,
  avatar: null,
  role: 'USER',
  mfaEnabled: false,
  mfaSecret: null,
  emailVerified: true,
  phoneVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

type DepOverrides = {
  sessionRepo?: Record<string, unknown>;
  tokenService?: Record<string, unknown>;
  tokenStorage?: Record<string, unknown>;
  mailService?: Record<string, unknown>;
};

const makeDeps = (
  userRepoOverrides: Record<string, unknown> = {},
  overrides: DepOverrides = {},
) => {
  const sessionRepo = {
    create: async () => {
      throw new Error('session must not be created');
    },
    ...overrides.sessionRepo,
  };
  const deps = {
    userRepo: { findByEmail: async () => null, ...userRepoOverrides },
    sessionRepo,
    tokenService: overrides.tokenService ?? {},
    tokenStorage: overrides.tokenStorage ?? {},
    totpService: {},
    prisma: {
      device: {
        create: async () => {
          throw new Error('device must not be created');
        },
      },
    },
    mailService: overrides.mailService ?? {},
  };
  return new AuthService(
    deps.userRepo as unknown as UserRepo,
    sessionRepo as unknown as SessionRepo,
    deps.tokenService as never,
    deps.tokenStorage as never,
    deps.totpService as never,
    deps.prisma as never,
    deps.mailService as never,
  );
};

describe('AuthService.login failure paths', () => {
  test('unknown email throws Invalid credentials', async () => {
    const service = makeDeps({ findByEmail: async () => null });
    expect(service.login({ email: 'nope@example.com', password: 'x' } as never)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  test('OAuth user without password hash throws Invalid credentials', async () => {
    const service = makeDeps({ findByEmail: async () => ({ ...baseUser, password: null }) });
    expect(service.login({ email: baseUser.email, password: 'x' } as never)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  test('wrong password throws Invalid credentials', async () => {
    const hashed = await argon2.hash('right-password');
    const service = makeDeps({ findByEmail: async () => ({ ...baseUser, password: hashed }) });
    expect(
      service.login({ email: baseUser.email, password: 'wrong-password' } as never),
    ).rejects.toThrow(UnauthorizedException);
  });

  test('unverified email throws BadRequest before any token work', async () => {
    const hashed = await argon2.hash('pw');
    const service = makeDeps({
      findByEmail: async () => ({ ...baseUser, password: hashed, emailVerified: false }),
    });
    expect(service.login({ email: baseUser.email, password: 'pw' } as never)).rejects.toThrow(
      BadRequestException,
    );
  });

  test('2FA-enabled user gets empty-token challenge without a session', async () => {
    const hashed = await argon2.hash('pw');
    const service = makeDeps({
      findByEmail: async () => ({ ...baseUser, password: hashed, mfaEnabled: true }),
    });
    // sessionRepo.create and prisma.device.create throw if reached

    const result = await service.login({ email: baseUser.email, password: 'pw' } as never);
    expect(result.requires2FA).toBe(true);
    expect(result.accessToken).toBe('');
    expect(result.refreshToken).toBe('');
  });
});

describe('AuthService.register', () => {
  test('duplicate email throws Conflict without creating a user', async () => {
    let created = false;
    const service = makeDeps({
      findByEmail: async () => ({ ...baseUser }),
      create: async () => {
        created = true;
        return {};
      },
    });

    await expect(
      service.register({ email: baseUser.email, password: 'pw' } as never),
    ).rejects.toThrow(ConflictException);
    expect(created).toBe(false);
  });

  test('stores a hashed password and emails the verification token', async () => {
    let createdData: Record<string, unknown> = {};
    const storedTokens: Record<string, string> = {};
    const emailed: string[] = [];
    const service = makeDeps(
      {
        create: async (data: Record<string, unknown>) => {
          createdData = data;
          return { id: 'new-user' };
        },
      },
      {
        tokenService: { generateEmailVerificationToken: () => 'tok-1' },
        tokenStorage: {
          storeEmailVerificationToken: async (token: string, userId: string) => {
            storedTokens[token] = userId;
          },
        },
        mailService: {
          sendVerificationEmail: async (_email: string, token: string) => {
            emailed.push(token);
          },
        },
      },
    );

    const result = await service.register({
      email: 'new@example.com',
      password: 'secret-pw',
      fullName: 'New User',
    } as never);

    expect(result).toEqual({ userId: 'new-user' });
    expect(await argon2.verify(createdData.password as string, 'secret-pw')).toBe(true);
    expect(createdData.emailVerified).toBe(false);
    expect(storedTokens['tok-1']).toBe('new-user');
    expect(emailed).toEqual(['tok-1']);
  });
});

describe('AuthService.verifyEmail', () => {
  test('unknown token throws NotFound', async () => {
    const service = makeDeps({} as never, {
      tokenStorage: { getEmailVerificationToken: async () => null },
    });

    await expect(service.verifyEmail({ token: 'bad' } as never)).rejects.toThrow(NotFoundException);
  });

  test('marks the email verified and consumes the token', async () => {
    let updated: Record<string, unknown> = {};
    let deletedToken: string | undefined;
    const service = makeDeps(
      {
        findById: async () => ({ ...baseUser, emailVerified: false }),
        update: async (_id: string, data: Record<string, unknown>) => {
          updated = data;
          return {};
        },
      },
      {
        tokenStorage: {
          getEmailVerificationToken: async () => 'user-1',
          deleteEmailVerificationToken: async (token: string) => {
            deletedToken = token;
          },
        },
      },
    );

    const result = await service.verifyEmail({ token: 'tok-1' } as never);

    expect(result).toEqual({ success: true });
    expect(updated).toEqual({ emailVerified: true });
    expect(deletedToken).toBe('tok-1');
  });
});

describe('AuthService.refresh', () => {
  const baseSession = {
    id: 'session-1',
    status: 'ACTIVE',
    expiresAt: new Date(Date.now() + 60_000),
    user: { email: baseUser.email, role: 'USER' },
  };

  test('unverifiable refresh token throws Unauthorized', async () => {
    const service = makeDeps({} as never, {
      tokenService: {
        verifyToken: () => {
          throw new Error('bad jwt');
        },
      },
    });

    await expect(service.refresh('garbage')).rejects.toThrow(UnauthorizedException);
  });

  test('revoked session throws Unauthorized', async () => {
    const service = makeDeps({} as never, {
      tokenService: { verifyToken: () => ({ sub: 'user-1' }) },
      sessionRepo: { findByRefreshToken: async () => ({ ...baseSession, status: 'REVOKED' }) },
    });

    await expect(service.refresh('current')).rejects.toThrow(UnauthorizedException);
  });

  test('expired session throws Unauthorized', async () => {
    const service = makeDeps({} as never, {
      tokenService: { verifyToken: () => ({ sub: 'user-1' }) },
      sessionRepo: {
        findByRefreshToken: async () => ({
          ...baseSession,
          expiresAt: new Date(Date.now() - 1000),
        }),
      },
    });

    await expect(service.refresh('current')).rejects.toThrow(UnauthorizedException);
  });

  test('rotates tokens against the live session', async () => {
    let rotatedTo: string | undefined;
    const service = makeDeps({} as never, {
      tokenService: {
        verifyToken: () => ({ sub: 'user-1' }),
        generateAccessToken: (payload: { sub: string; role: string }) =>
          `access:${payload.sub}:${payload.role}`,
        generateRefreshToken: (payload: { sub: string }) => `refresh:${payload.sub}`,
      },
      sessionRepo: {
        findByRefreshToken: async () => baseSession,
        updateRefreshToken: async (_id: string, token: string) => {
          rotatedTo = token;
        },
      },
      tokenStorage: { getSessionMfaVerified: async () => false },
    });

    const result = await service.refresh('current');

    expect(result).toEqual({ accessToken: 'access:user-1:USER', refreshToken: 'refresh:user-1' });
    expect(rotatedTo).toBe('refresh:user-1');
  });
});

describe('AuthService.logout', () => {
  test('with a sessionId revokes only that session', async () => {
    const revoked: string[] = [];
    const service = makeDeps({} as never, {
      sessionRepo: {
        revoke: async (id: string) => {
          revoked.push(id);
        },
        revokeAllByUserId: async () => {
          throw new Error('must not revoke all sessions');
        },
      },
    });

    const result = await service.logout('user-1', 'session-1');

    expect(result).toEqual({ success: true });
    expect(revoked).toEqual(['session-1']);
  });

  test('without a sessionId revokes every session of the user', async () => {
    let revokedFor: string | undefined;
    const service = makeDeps({} as never, {
      sessionRepo: {
        revoke: async () => {
          throw new Error('must not revoke a single session');
        },
        revokeAllByUserId: async (userId: string) => {
          revokedFor = userId;
        },
      },
    });

    const result = await service.logout('user-1');

    expect(result).toEqual({ success: true });
    expect(revokedFor).toBe('user-1');
  });
});

describe('AuthService.getCurrentUser & getSessions', () => {
  test('getCurrentUser throws NotFound for unknown id', async () => {
    const service = makeDeps({ findById: async () => null });

    await expect(service.getCurrentUser('ghost')).rejects.toThrow(NotFoundException);
  });

  test('getSessions maps device fields when present', async () => {
    const now = new Date();
    const service = makeDeps({} as never, {
      sessionRepo: {
        findByUserId: async () => [
          {
            id: 's1',
            deviceId: 'd1',
            device: { name: 'iPhone', type: 'MOBILE', lastSeenAt: now },
            ipAddress: '1.2.3.4',
            userAgent: 'ua',
            status: 'ACTIVE',
            createdAt: now,
            expiresAt: now,
          },
          {
            id: 's2',
            deviceId: null,
            device: null,
            ipAddress: null,
            userAgent: null,
            status: 'ACTIVE',
            createdAt: now,
            expiresAt: now,
          },
        ],
      },
    });

    const sessions = await service.getSessions('user-1');

    expect(sessions[0].device).toEqual({
      id: 'd1',
      name: 'iPhone',
      type: 'MOBILE',
      lastSeenAt: now,
    });
    expect(sessions[1].device).toBeNull();
  });
});

describe('AuthService.enable2FA', () => {
  test('unknown user throws NotFound', async () => {
    const service = makeDeps({ findById: async () => null });

    await expect(service.enable2FA('ghost')).rejects.toThrow(NotFoundException);
  });

  test('already-enabled 2FA throws BadRequest', async () => {
    const service = makeDeps({ findById: async () => ({ ...baseUser, mfaEnabled: true }) });

    await expect(service.enable2FA('user-1')).rejects.toThrow(BadRequestException);
  });

  test('creates an unverified TOTP method plus hashed backup codes', async () => {
    let mfaMethodData: Record<string, unknown> | undefined;
    let updatedSecret: Record<string, unknown> | undefined;
    const backupCodesCreated: Record<string, unknown>[] = [];
    const totpService = {
      generateSecret: () => 'BASE32SECRET',
      generateQRCode: async () => 'data:image/png;base64,qr',
      generateBackupCodes: () => ['11111111', '22222222'],
    };
    const prisma = {
      userMFAMethod: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          mfaMethodData = data;
          return { id: 'm1' };
        },
      },
      mFABackupCode: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          backupCodesCreated.push(data);
          return { id: 'b' };
        },
      },
      device: {
        create: async () => {
          throw new Error('no device during enable2FA');
        },
      },
    };
    const service = new AuthService(
      {
        findById: async () => ({ ...baseUser, mfaEnabled: false }),
        update: async (_id: string, data: Record<string, unknown>) => {
          updatedSecret = data;
          return {};
        },
      } as never,
      {} as never,
      {} as never,
      {} as never,
      totpService as never,
      prisma as never,
      {} as never,
    );

    const result = await service.enable2FA('user-1');

    expect(result.qrCode).toMatch(/^data:image\/png/);
    expect(result.secret).toBe('BASE32SECRET');
    expect(result.backupCodes).toEqual(['11111111', '22222222']);
    expect(mfaMethodData).toMatchObject({
      userId: 'user-1',
      secret: 'BASE32SECRET',
      isActive: false,
      isVerified: false,
    });
    expect(backupCodesCreated).toHaveLength(2);
    // stored codes must be hashes, not plaintext
    expect(await argon2.verify(String(backupCodesCreated[0].code), '11111111')).toBe(true);
    expect(updatedSecret).toEqual({ mfaSecret: 'BASE32SECRET' });
  });
});

describe('AuthService.verify2FA', () => {
  const mfaUser = { ...baseUser, mfaSecret: 'SECRET', mfaEnabled: false };

  const makeMfaDeps = (overrides: Record<string, Record<string, unknown>> = {}) => {
    const calls: string[] = [];
    const prisma = {
      userMFAMethod: {
        findFirst: async () => null,
        update: async ({ data }: { data: Record<string, unknown> }) => {
          calls.push(`method-update:${JSON.stringify(data)}`);
          return {};
        },
        ...overrides.userMFAMethod,
      },
      mFABackupCode: {
        findMany: async () => [],
        update: async ({ data }: { data: Record<string, unknown> }) => {
          calls.push(`backup-used:${JSON.stringify(data)}`);
          return {};
        },
        ...overrides.mFABackupCode,
      },
      device: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          calls.push('device-create');
          return { id: 'device-1', ...data };
        },
        ...overrides.device,
      },
    };
    const sessionRepo = {
      create: async (data: Record<string, unknown>) => {
        calls.push('session-create');
        return { id: 'session-9', ...data };
      },
      ...overrides.sessionRepo,
    };
    const service = new AuthService(
      {
        findByIdWithSecrets: async () => ('user' in overrides ? overrides.user : mfaUser),
        update: async (_id: string, data: Record<string, unknown>) => {
          calls.push(`user-update:${JSON.stringify(data)}`);
          return {};
        },
      } as never,
      sessionRepo as never,
      {
        generateAccessToken: () => 'access-1',
        generateRefreshToken: () => 'refresh-1',
        ...(overrides.tokenService ?? {}),
      } as never,
      {
        storeSessionMfaVerified: async () => calls.push('store-mfa'),
        ...(overrides.tokenStorage ?? {}),
      } as never,
      {
        verifyCode: () => true,
        ...(overrides.totpService ?? {}),
      } as never,
      prisma as never,
      {} as never,
    );
    return { calls, service };
  };

  test('unknown user throws NotFound', async () => {
    const { service } = makeMfaDeps({ user: null as never });

    await expect(service.verify2FA('ghost', { code: '123456' } as never)).rejects.toThrow(
      NotFoundException,
    );
  });

  test('no configured TOTP throws BadRequest', async () => {
    const { service } = makeMfaDeps({ user: { ...baseUser, mfaSecret: null } });

    await expect(service.verify2FA('user-1', { code: '123456' } as never)).rejects.toThrow(
      BadRequestException,
    );
  });

  test('first verification activates the method and flips mfaEnabled', async () => {
    const { calls, service } = makeMfaDeps({
      userMFAMethod: {
        findFirst: async () => ({ id: 'm1', secret: 'SECRET', isVerified: false }),
      },
    });

    const result = await service.verify2FA('user-1', { code: '123456' } as never);

    expect(result).toEqual({ verified: true });
    expect(calls.some((c) => c.startsWith('method-update'))).toBe(true);
    expect(calls).toContain('user-update:{"mfaEnabled":true}');
  });

  test('valid backup code is consumed when the TOTP code fails', async () => {
    const hashed = await argon2.hash('11111111');
    const { calls, service } = makeMfaDeps({
      totpService: { verifyCode: () => false },
      mFABackupCode: {
        findMany: async () => [{ id: 'bk-1', code: hashed }],
      },
    });

    const result = await service.verify2FA('user-1', { code: '11111111' } as never);

    expect(result.verified).toBe(true);
    expect(calls.some((c) => c.startsWith('backup-used') && c.includes('"isUsed":true'))).toBe(
      true,
    );
  });

  test('wrong TOTP without a matching backup throws Unauthorized', async () => {
    const { service } = makeMfaDeps({
      totpService: { verifyCode: () => false },
      mFABackupCode: {
        findMany: async () => [{ id: 'bk-1', code: await argon2.hash('99999999') }],
      },
    });

    await expect(service.verify2FA('user-1', { code: '11111111' } as never)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  test('challenge completion issues tokens, a session, and stores the MFA flag', async () => {
    const { calls, service } = makeMfaDeps({});

    const result = await service.verify2FA(
      'user-1',
      { code: '123456', sessionId: 'pending-session' } as never,
      '10.0.0.1',
      'Mozilla/5.0 (iPhone)',
    );

    expect(result.accessToken).toBe('access-1');
    expect(result.refreshToken).toBe('refresh-1');
    expect(result.user).toMatchObject({ id: baseUser.id, email: baseUser.email });
    for (const step of ['device-create', 'session-create', 'store-mfa']) {
      expect(calls).toContain(step);
    }
  });
});

describe('AuthService password reset', () => {
  test('requestPasswordReset stays silent for unknown emails', async () => {
    const service = makeDeps(
      {},
      {
        mailService: {
          sendPasswordResetEmail: async () => {
            throw new Error('must not email unknown users');
          },
        },
        tokenStorage: {
          storePasswordResetToken: async () => {
            throw new Error('must not store token');
          },
        },
      },
    );

    const result = await service.requestPasswordReset({ email: 'ghost@example.com' } as never);

    expect(result).toEqual({ success: true });
  });

  test('requestPasswordReset stores a token and emails it', async () => {
    const stored: Record<string, string> = {};
    const emailed: string[] = [];
    const service = makeDeps(
      { findByEmail: async () => baseUser },
      {
        tokenService: { generatePasswordResetToken: () => 'reset-tok' },
        tokenStorage: {
          storePasswordResetToken: async (token: string, userId: string) => {
            stored[token] = userId;
          },
        },
        mailService: {
          sendPasswordResetEmail: async (_email: string, token: string) => {
            emailed.push(token);
          },
        },
      },
    );

    await service.requestPasswordReset({ email: baseUser.email } as never);

    expect(stored['reset-tok']).toBe(baseUser.id);
    expect(emailed).toEqual(['reset-tok']);
  });

  test('resetPassword rejects unknown or expired tokens', async () => {
    const service = makeDeps(
      {},
      {
        tokenStorage: { getPasswordResetToken: async () => null },
      },
    );

    await expect(
      service.resetPassword({ token: 'bad', newPassword: 'x' } as never),
    ).rejects.toThrow(NotFoundException);
  });

  test('resetPassword hashes the new password, revokes sessions, consumes the token', async () => {
    let updated: Record<string, unknown> = {};
    let revokedFor: string | undefined;
    let deletedToken: string | undefined;
    const service = makeDeps(
      {
        findById: async () => baseUser,
        update: async (_id: string, data: Record<string, unknown>) => {
          updated = data;
          return {};
        },
      },
      {
        tokenStorage: {
          getPasswordResetToken: async () => 'user-1',
          deletePasswordResetToken: async (token: string) => {
            deletedToken = token;
          },
        },
        sessionRepo: {
          revokeAllByUserId: async (userId: string) => {
            revokedFor = userId;
          },
        },
      },
    );

    const result = await service.resetPassword({
      token: 'tok',
      newPassword: 'brand-new-pw',
    } as never);

    expect(result).toEqual({ success: true });
    expect(await argon2.verify(updated.password as string, 'brand-new-pw')).toBe(true);
    expect(revokedFor).toBe(baseUser.id);
    expect(deletedToken).toBe('tok');
  });
});

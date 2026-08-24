import { DeviceType } from '@prisma/client';
import { describe, expect, test } from 'bun:test';

import { UserRepo } from '@/users/repo';

import { SessionRepo } from '../repo';
import { TokenStorageService } from '../infrastructure';
import { SessionIssuer } from './session-issuer.service';

const baseUser = {
  id: 'user-1',
  email: 'user@example.com',
  role: 'USER',
};

const makeIssuer = (overrides: Record<string, Record<string, unknown>> = {}) => {
  const calls: string[] = [];
  const deps = {
    userRepo: {
      findById: async () => ({ ...baseUser }),
      ...overrides.userRepo,
    },
    prisma: {
      device: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          calls.push(`device-create:${JSON.stringify(data)}`);
          return { id: 'device-1' };
        },
        ...overrides.device,
      },
      ...overrides.prismaRoot,
    },
    tokenService: {
      generateAccessToken: (_payload: unknown, sessionId?: string) => {
        calls.push(`access-token:${sessionId}`);
        return 'access-token';
      },
      generateRefreshToken: () => 'refresh-token',
      ...overrides.tokenService,
    },
    sessionRepo: {
      create: async (data: Record<string, unknown>, id?: string) => {
        calls.push(`session-create:${id}:${JSON.stringify(data)}`);
        return { id, ...data };
      },
      ...overrides.sessionRepo,
    },
    tokenStorage: {
      storeSessionMfaVerified: async (sessionId: string, ttl: number) => {
        calls.push(`mfa-flag:${sessionId}:${ttl}`);
      },
      ...overrides.tokenStorage,
    },
  };
  const issuer = new SessionIssuer(
    deps.userRepo as unknown as UserRepo,
    deps.prisma as never,
    deps.tokenService as never,
    deps.sessionRepo as unknown as SessionRepo,
    deps.tokenStorage as unknown as TokenStorageService,
  );
  return { calls, issuer };
};

const issueArgs = {
  ip: '10.0.0.1',
  userAgent: 'Mozilla/5.0 (iPhone)',
  ttlSeconds: 7 * 24 * 60 * 60,
} as const;

describe('SessionIssuer.issue', () => {
  test('wires one shared session id through the access token and the repo', async () => {
    let accessTokenSessionId: string | undefined;
    let createdWithId: string | undefined;
    let createdData: Record<string, unknown> | undefined;
    const { issuer } = makeIssuer({
      tokenService: {
        generateAccessToken: (_payload: unknown, sessionId?: string) => {
          accessTokenSessionId = sessionId;
          return 'access-token';
        },
        generateRefreshToken: () => 'refresh-token',
      },
      sessionRepo: {
        create: async (data: Record<string, unknown>, id?: string) => {
          createdData = data;
          createdWithId = id;
          return { id, ...data };
        },
      },
    });

    const result = await issuer.issue(baseUser.id, { ...issueArgs, mfaTrusted: true });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    // one randomUUID shared by jti claim, repo row, and the returned session
    expect(accessTokenSessionId).toBe(createdWithId);
    expect(result.session.id).toBe(createdWithId!);
    expect(createdData).toMatchObject({
      userId: baseUser.id,
      token: 'access-token',
      refreshToken: 'refresh-token',
      ipAddress: issueArgs.ip,
      userAgent: issueArgs.userAgent,
    });
  });

  test('parses the UA into a device row with a fingerprint', async () => {
    const { calls, issuer } = makeIssuer();

    await issuer.issue(baseUser.id, { ...issueArgs, mfaTrusted: false });

    const deviceCall = calls.find((c) => c.startsWith('device-create'));
    expect(deviceCall).toBeTruthy();
    const data = JSON.parse(deviceCall!.slice('device-create:'.length));
    expect(data.type).toBe(DeviceType.MOBILE);
    expect(data.userId).toBe(baseUser.id);
    expect(data.ipAddress).toBe(issueArgs.ip);
    expect(data.fingerprint).toBe(
      Buffer.from(`${issueArgs.userAgent}|${issueArgs.ip}`).toString('base64').substring(0, 255),
    );
  });

  test('no userAgent means no device row but the session still issues', async () => {
    const { calls, issuer } = makeIssuer({
      device: {
        create: async () => {
          throw new Error('must not create a device without userAgent');
        },
      },
    });

    const result = await issuer.issue(baseUser.id, {
      ip: issueArgs.ip,
      mfaTrusted: true,
      ttlSeconds: issueArgs.ttlSeconds,
    });

    expect(result.accessToken).toBe('access-token');
    expect(calls.some((c) => c.startsWith('device-create'))).toBe(false);
    expect(calls.some((c) => c.startsWith('session-create'))).toBe(true);
  });

  test('stores the MFA flag with the remaining TTL when trusted', async () => {
    const { calls, issuer } = makeIssuer();

    const result = await issuer.issue(baseUser.id, { ...issueArgs, mfaTrusted: true });

    const flag = calls.find((c) => c.startsWith('mfa-flag'));
    expect(flag).toContain(`mfa-flag:${result.session.id}:`);
    const ttl = Number(flag!.split(':')[2]);
    // ~7 days minus elapsed time between expiry math and the flag store
    expect(ttl).toBeGreaterThan(7 * 24 * 3600 - 10);
    expect(ttl).toBeLessThanOrEqual(7 * 24 * 3600);
  });

  test('skips the MFA flag when not trusted', async () => {
    const { calls, issuer } = makeIssuer({
      tokenStorage: {
        storeSessionMfaVerified: async () => {
          throw new Error('must not store the MFA flag');
        },
      },
    });

    await issuer.issue(baseUser.id, { ...issueArgs, mfaTrusted: false });

    expect(calls.some((c) => c.startsWith('mfa-flag'))).toBe(false);
  });
});

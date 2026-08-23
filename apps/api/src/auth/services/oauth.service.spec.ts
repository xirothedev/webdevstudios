import { describe, expect, test } from 'bun:test';

import { UserRepo } from '@/users/repo';

import { OAuthService } from './oauth.service';

// pins the ExternalAccount invariants documented in apps/api/CONTEXT.md
const oauthUser = {
  provider: 'GOOGLE' as const,
  providerId: 'google-123',
  email: 'oauth@example.com',
  name: 'OAuth User',
  picture: 'https://cdn.example.com/a.png',
};

const externalAccount = {
  provider: 'GOOGLE',
  providerId: 'google-123',
  providerEmail: 'old@example.com',
  userId: 'user-1',
  user: {
    id: 'user-1',
    email: 'oauth@example.com',
    fullName: 'OAuth User',
    role: 'USER',
    emailVerified: true,
    avatar: null,
  },
};

const makeService = (overrides: Record<string, Record<string, unknown>> = {}) => {
  const calls: string[] = [];
  const deps = {
    userRepo: {
      findByEmail: async () => null,
      create: async (data: Record<string, unknown>) => {
        calls.push(`create-user:${JSON.stringify(data)}`);
        return { id: 'user-new', avatar: null, ...data };
      },
      update: async (_id: string, data: Record<string, unknown>) => {
        calls.push(`update-user:${JSON.stringify(data)}`);
        return {};
      },
      ...overrides.userRepo,
    },
    prisma: {
      externalAccount: {
        findUnique: async () => null,
        update: async ({ data }: { data: Record<string, unknown> }) => {
          calls.push(`provider-email:${JSON.stringify(data)}`);
          return {};
        },
        create: async ({ data }: { data: Record<string, unknown> }) => {
          calls.push(`link-account:${JSON.stringify(data)}`);
          return { id: 'ext-1', ...data };
        },
        ...overrides.externalAccount,
      },
      ...overrides.prismaRoot,
    },
    sessionIssuer: {
      issue: async (userId: string, opts: Record<string, unknown>) => {
        calls.push(`issuer-issue:${JSON.stringify({ userId, opts })}`);
        return {
          session: { id: 'session-oauth' },
          accessToken: 'access-oauth',
          refreshToken: 'refresh-oauth',
        };
      },
      ...overrides.sessionIssuer,
    },
  };
  const service = new OAuthService(
    deps.userRepo as unknown as UserRepo,
    deps.prisma as never,
    deps.sessionIssuer as never,
  );
  return { calls, service };
};

describe('OAuthService.handleOAuthCallback', () => {
  test('returning accounts log in and refresh the stored providerEmail', async () => {
    const { calls, service } = makeService({
      externalAccount: {
        findUnique: async () => ({ ...externalAccount }),
      },
    });

    const result = await service.handleOAuthCallback(
      { ...oauthUser, email: 'current@example.com' },
      '10.0.0.9',
      'Mozilla/5.0 (iPhone)',
    );

    expect(result).toMatchObject({
      accessToken: 'access-oauth',
      refreshToken: 'refresh-oauth',
      user: { id: 'user-1', email: 'oauth@example.com' },
    });
    expect(calls.some((c) => c.includes('"providerEmail":"current@example.com"'))).toBe(true);
    // login path must not touch profile fields or re-create the link
    expect(calls.some((c) => c.startsWith('update-user'))).toBe(false);
    expect(calls.some((c) => c.startsWith('link-account'))).toBe(false);
  });

  test('matching email links the ExternalAccount without touching the user', async () => {
    const { calls, service } = makeService({
      userRepo: {
        findByEmail: async () => ({
          id: 'user-existing',
          email: oauthUser.email,
          avatar: 'https://shop.example/own.webp',
        }),
      },
    });

    await service.handleOAuthCallback(oauthUser);

    expect(
      calls.some((c) => c.startsWith('link-account') && c.includes('"userId":"user-existing"')),
    ).toBe(true);
    expect(calls.some((c) => c.startsWith('update-user'))).toBe(false);
    expect(calls.some((c) => c.startsWith('create-user'))).toBe(false);
  });

  test('unknown emails create a verified user with the provider avatar', async () => {
    const { calls, service } = makeService();

    const result = await service.handleOAuthCallback(oauthUser);

    expect(result.user.id).toBe('user-new');
    expect(calls.some((c) => c.includes('"emailVerified":true'))).toBe(true);
    expect(calls.some((c) => c.startsWith('update-user') && c.includes(oauthUser.picture))).toBe(
      true,
    );
    expect(calls.some((c) => c.startsWith('link-account'))).toBe(true);
  });

  test('new users without a provider picture get no avatar update', async () => {
    const { calls, service } = makeService();

    await service.handleOAuthCallback({ ...oauthUser, picture: undefined });

    expect(calls.some((c) => c.startsWith('update-user'))).toBe(false);
  });

  test('sessions are issued MFA-verified for the full 30 days', async () => {
    const { calls, service } = makeService({
      externalAccount: { findUnique: async () => ({ ...externalAccount }) },
    });

    await service.handleOAuthCallback(oauthUser);

    const issueCall = calls.find((c) => c.startsWith('issuer-issue'));
    expect(issueCall).toBeTruthy();
    const { userId, opts } = JSON.parse(issueCall!.slice('issuer-issue:'.length));
    expect(userId).toBe('user-1');
    expect(opts).toMatchObject({ mfaTrusted: true, ttlSeconds: 30 * 24 * 60 * 60 });
  });
});

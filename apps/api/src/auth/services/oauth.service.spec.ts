import { describe, expect, test } from 'bun:test';

import { ExternalAccountRepo } from '../repo';
import { OAuthService } from './oauth.service';

const oauthUser = {
  provider: 'GOOGLE' as const,
  providerId: 'google-123',
  email: 'oauth@example.com',
  name: 'OAuth User',
  picture: 'https://cdn.example.com/a.png',
};

const resolvedUser = {
  id: 'user-1',
  email: 'oauth@example.com',
  fullName: 'OAuth User',
  avatar: null,
  emailVerified: true,
};

const makeService = (overrides: Record<string, Record<string, unknown>> = {}) => {
  const calls: string[] = [];
  const deps = {
    externalAccountRepo: {
      findOrLinkOrCreate: async (profile: Record<string, unknown>) => {
        calls.push(`resolve-identity:${JSON.stringify(profile)}`);
        return overrides.resolvedUser ?? { ...resolvedUser };
      },
      ...overrides.externalAccountRepo,
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
    deps.externalAccountRepo as unknown as ExternalAccountRepo,
    deps.sessionIssuer as never,
  );
  return { calls, service };
};

describe('OAuthService.handleOAuthCallback', () => {
  test('delegates identity resolution to the ExternalAccountRepo untouched', async () => {
    const { calls, service } = makeService();

    await service.handleOAuthCallback(oauthUser, '10.0.0.9', 'Mozilla/5.0 (iPhone)');

    const resolveCall = calls.find((c) => c.startsWith('resolve-identity'));
    expect(JSON.parse(resolveCall!.slice('resolve-identity:'.length))).toEqual(oauthUser);
  });

  test('returns the resolved identity with issued tokens', async () => {
    const { service } = makeService({
      resolvedUser: { ...resolvedUser, id: 'user-x', email: 'x@example.com' },
    });

    const result = await service.handleOAuthCallback(oauthUser);

    expect(result).toMatchObject({
      accessToken: 'access-oauth',
      refreshToken: 'refresh-oauth',
      user: { id: 'user-x', email: 'x@example.com' },
    });
  });

  test('sessions are issued MFA-verified for the full 30 days', async () => {
    const { calls, service } = makeService();

    const result = await service.handleOAuthCallback(oauthUser);

    const issueCall = calls.find((c) => c.startsWith('issuer-issue'));
    expect(issueCall).toBeTruthy();
    const { userId, opts } = JSON.parse(issueCall!.slice('issuer-issue:'.length));
    expect(userId).toBe('user-1');
    expect(opts).toMatchObject({ mfaTrusted: true, ttlSeconds: 30 * 24 * 60 * 60 });
    // cookie write downstream reuses the issuer ttl
    expect(result.ttlSeconds).toBe(opts.ttlSeconds);
  });
});

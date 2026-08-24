import { describe, expect, test } from 'bun:test';

import { ExternalAccountRepo } from './external-account.repo';

// pins the ExternalAccount invariants documented in apps/api/CONTEXT.md
const profile = {
  provider: 'GOOGLE' as const,
  providerId: 'google-123',
  email: 'oauth@example.com',
  name: 'OAuth User',
  picture: 'https://cdn.example.com/a.png',
};

type Overrides = {
  linkedUser?: Record<string, unknown> | null;
  externalAccount?: Record<string, unknown>;
  user?: Record<string, unknown>;
};

const makeRepo = (overrides: Overrides = {}) => {
  const calls: string[] = [];
  const db = {
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
    user: {
      findUnique: async ({ where }: { where: { email: string } }) => {
        calls.push(`find-user:${where.email}`);
        return overrides.linkedUser ?? null;
      },
      create: async ({ data }: { data: Record<string, unknown> }) => {
        calls.push(`create-user:${JSON.stringify(data)}`);
        return { id: 'user-new', avatar: null, ...data };
      },
      update: async (_args: unknown) => {
        calls.push('update-user');
        return {};
      },
      ...overrides.user,
    },
  };
  const prisma = {
    ...db,
    $transaction: async <T>(fn: (tx: typeof db) => Promise<T>): Promise<T> => {
      calls.push('begin-tx');
      const result = await fn(db);
      calls.push('commit-tx');
      return result;
    },
  };
  return { calls, repo: new ExternalAccountRepo(prisma as never) };
};

describe('ExternalAccountRepo.findOrLinkOrCreate', () => {
  test('matching email links the account to the existing user without touching them', async () => {
    const linkedUser = { id: 'user-existing', email: profile.email, avatar: null };
    const { calls, repo } = makeRepo({ linkedUser });

    const user = await repo.findOrLinkOrCreate(profile);

    expect(user.id).toBe('user-existing');
    expect(
      calls.some((c) => c.startsWith('link-account') && c.includes('"userId":"user-existing"')),
    ).toBe(true);
    expect(calls.some((c) => c.startsWith('create-user'))).toBe(false);
    expect(calls.some((c) => c.startsWith('update-user'))).toBe(false);
  });

  test('repeat login refreshes providerEmail but never overwrites the avatar', async () => {
    const { calls, repo } = makeRepo({
      externalAccount: {
        findUnique: async () => ({
          id: 'ext-1',
          provider: profile.provider,
          providerId: profile.providerId,
          providerEmail: 'stale@example.com',
          user: {
            id: 'user-1',
            email: profile.email,
            fullName: 'OAuth User',
            avatar: 'https://shop.example/own.webp',
            emailVerified: true,
          },
        }),
      },
    });

    const user = await repo.findOrLinkOrCreate(profile);

    expect(user.id).toBe('user-1');
    expect(calls.some((c) => c.includes('"providerEmail":"oauth@example.com"'))).toBe(true);
    expect(calls.some((c) => c.startsWith('update-user'))).toBe(false);
    expect(calls.some((c) => c.startsWith('link-account'))).toBe(false);
    expect(calls.some((c) => c.startsWith('create-user'))).toBe(false);
  });

  test('unknown email creates a verified user carrying the provider avatar', async () => {
    const { calls, repo } = makeRepo();

    const user = await repo.findOrLinkOrCreate(profile);

    expect(user.id).toBe('user-new');
    expect(calls.some((c) => c.includes('"emailVerified":true'))).toBe(true);
    expect(calls.some((c) => c.startsWith('create-user') && c.includes(profile.picture))).toBe(
      true,
    );
    expect(calls.some((c) => c.startsWith('link-account'))).toBe(true);
  });

  test('no provider picture creates the user without an avatar write', async () => {
    const { calls, repo } = makeRepo();

    await repo.findOrLinkOrCreate({ ...profile, picture: undefined });

    expect(calls.some((c) => c.startsWith('create-user') && c.includes('avatar'))).toBe(false);
    expect(calls.some((c) => c.startsWith('update-user'))).toBe(false);
  });

  test('identity resolution runs inside a single transaction by default', async () => {
    const { calls, repo } = makeRepo();

    await repo.findOrLinkOrCreate(profile);

    expect(calls[0]).toBe('begin-tx');
    expect(calls[calls.length - 1]).toBe('commit-tx');
  });
});

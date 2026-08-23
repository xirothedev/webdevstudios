import { describe, expect, test } from 'bun:test';
import * as argon2 from 'argon2';

import { MfaRepo } from './mfa.repo';

type Overrides = {
  userMFAMethod?: Record<string, unknown>;
  mFABackupCode?: Record<string, unknown>;
  user?: Record<string, unknown>;
};

const makeRepo = (overrides: Overrides = {}) => {
  const calls: string[] = [];
  const prisma = {
    userMFAMethod: {
      findFirst: async () => null,
      create: async ({ data }: { data: Record<string, unknown> }) => {
        calls.push(`method-create:${JSON.stringify(data)}`);
        return { id: 'm1', ...data };
      },
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        calls.push(`method-update:${where.id}:${JSON.stringify(data)}`);
        return {};
      },
      ...overrides.userMFAMethod,
    },
    mFABackupCode: {
      findMany: async () => [] as { id: string; code: string; isUsed: boolean }[],
      createMany: async ({ data }: { data: { userId: string; code: string }[] }) => {
        calls.push(`codes-create:${JSON.stringify(data)}`);
        return { count: data.length };
      },
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        calls.push(`code-consume:${where.id}:${JSON.stringify(data)}`);
        return {};
      },
      ...overrides.mFABackupCode,
    },
    user: {
      findUnique: async () => null,
      ...overrides.user,
    },
  };
  return { calls, repo: new MfaRepo(prisma as never) };
};

describe('MfaRepo.resolveSecret', () => {
  test('prefers the active TOTP method over the legacy column', async () => {
    const { calls, repo } = makeRepo({
      userMFAMethod: {
        findFirst: async () => ({ id: 'm1', secret: 'METHOD_SECRET', isVerified: true }),
      },
      user: {
        findUnique: async () => {
          throw new Error('legacy lookup must not run when a method secret exists');
        },
      },
    });

    expect(await repo.resolveSecret('user-1')).toBe('METHOD_SECRET');
    expect(calls).toHaveLength(0);
  });

  test('falls back to the legacy User.mfaSecret when no active method exists', async () => {
    const { repo } = makeRepo({
      user: { findUnique: async () => ({ mfaSecret: 'LEGACY_SECRET' }) },
    });

    expect(await repo.resolveSecret('user-1')).toBe('LEGACY_SECRET');
  });

  test('returns null for users with no MFA configured at all', async () => {
    const { repo } = makeRepo();

    expect(await repo.resolveSecret('user-1')).toBeNull();
  });
});

describe('MfaRepo.verifyBackupCodeAndConsume', () => {
  test('a backup code is consumed exactly once', async () => {
    const hashed = await argon2.hash('11111111');
    const rows = [{ id: 'bk-1', code: hashed, isUsed: false }];
    const consumedAt: Date[] = [];
    const { calls, repo } = makeRepo({
      mFABackupCode: {
        findMany: async () => rows.filter((row) => !row.isUsed),
        update: async ({ where, data }) => {
          const row = rows.find((r) => r.id === where.id);
          if (!row) throw new Error(`unknown code ${where.id}`);
          row.isUsed = true;
          consumedAt.push(data.usedAt as Date);
          calls.push(`code-consume:${where.id}`);
          return {};
        },
      },
    });

    expect(await repo.verifyBackupCodeAndConsume('user-1', '11111111')).toBe(true);
    expect(await repo.verifyBackupCodeAndConsume('user-1', '11111111')).toBe(false);
    expect(consumedAt[0]).toBeInstanceOf(Date);
    expect(calls.filter((c) => c.startsWith('code-consume'))).toEqual(['code-consume:bk-1']);
  });

  test('returns false when no stored code matches', async () => {
    const { repo } = makeRepo({
      mFABackupCode: {
        findMany: async () => [{ id: 'bk-1', code: await argon2.hash('99999999'), isUsed: false }],
      },
    });

    expect(await repo.verifyBackupCodeAndConsume('user-1', '11111111')).toBe(false);
  });
});

describe('MfaRepo.provisionTotp & activateTotp', () => {
  test('provisioning stores an unverified inactive method plus all hashed codes', async () => {
    const { calls, repo } = makeRepo();

    await repo.provisionTotp('user-1', 'BASE32SECRET', ['hash-a', 'hash-b']);

    expect(
      calls.some(
        (c) =>
          c.includes('"methodType":"TOTP"') &&
          c.includes('"secret":"BASE32SECRET"') &&
          c.includes('"isActive":false') &&
          c.includes('"isVerified":false'),
      ),
    ).toBe(true);
    const codesCall = calls.find((c) => c.startsWith('codes-create'));
    expect(JSON.parse(codesCall!.slice('codes-create:'.length))).toMatchObject([
      { userId: 'user-1', code: 'hash-a' },
      { userId: 'user-1', code: 'hash-b' },
    ]);
  });

  test('activation flips the method to verified and active', async () => {
    const { calls, repo } = makeRepo();

    await repo.activateTotp('m1');

    expect(calls).toContain('method-update:m1:{"isVerified":true,"isActive":true}');
  });
});

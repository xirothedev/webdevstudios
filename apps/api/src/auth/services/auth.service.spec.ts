import { BadRequestException, UnauthorizedException } from '@nestjs/common';
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

const makeDeps = (userRepoOverrides: Record<string, unknown> = {}) => {
  const sessionRepo = {
    create: async () => {
      throw new Error('session must not be created');
    },
  };
  const deps = {
    userRepo: { findByEmail: async () => null, ...userRepoOverrides },
    sessionRepo,
    tokenService: {},
    tokenStorage: {},
    totpService: {},
    prisma: {
      device: {
        create: async () => {
          throw new Error('device must not be created');
        },
      },
    },
    mailService: {},
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
    let storedMfa = false;
    const service = makeDeps({
      findByEmail: async () => ({ ...baseUser, password: hashed, mfaEnabled: true }),
    });
    // sessionRepo.create and prisma.device.create throw if reached

    const result = await service.login({ email: baseUser.email, password: 'pw' } as never);
    expect(result.requires2FA).toBe(true);
    expect(result.accessToken).toBe('');
    expect(result.refreshToken).toBe('');
    expect(storedMfa).toBe(false);
  });
});

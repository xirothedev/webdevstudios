import { describe, expect, test } from 'bun:test';

import { StorageService } from '../../storage/storage.service';
import { UserRepo } from '../repo';
import { UsersService } from './users.service';

// ponytail: hand-rolled fakes per repo-seam rule; swap for a builder if this file grows past ~150 lines
const fullUser = {
  id: 'user-1',
  email: 'user@example.com',
  fullName: 'Test User',
  phone: '+84123456789',
  avatar: 'https://example.com/a.webp',
  role: 'USER',
  mfaEnabled: false,
  emailVerified: true,
  phoneVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const makeService = (repoOverrides: Record<string, unknown> = {}) =>
  new UsersService(
    { findById: async () => fullUser, ...repoOverrides } as unknown as UserRepo,
    {} as unknown as StorageService,
  );

describe('UsersService.getUserById privacy branch', () => {
  test('self request sees private data', async () => {
    const service = makeService();
    const result = await service.getUserById('user-1', 'user-1');
    expect(result).toEqual(fullUser);
  });

  test('admin requester sees private data', async () => {
    const service = makeService();
    const result = await service.getUserById('user-1', 'other-user', 'ADMIN');
    expect(result).toEqual(fullUser);
  });

  test('anonymous/other requester sees only public shape', async () => {
    const service = makeService();
    const result = await service.getUserById('user-1', undefined);
    expect(result).toEqual({
      id: 'user-1',
      fullName: 'Test User',
      avatar: 'https://example.com/a.webp',
    });
  });
});

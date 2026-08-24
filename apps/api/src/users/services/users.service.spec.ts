import { NotFoundException } from '@nestjs/common';
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

const makeStorage = (overrides: Record<string, unknown> = {}) =>
  ({
    deleteFile: async () => {},
    // ponytail: fixtures use absolute URLs, identity passthrough keeps them observable
    resolveMediaUrl: (ref: string | null | undefined) => ref ?? null,
    uploadImage: async ({ key }: { key: string }) => ({ key, url: `https://cdn.test/${key}` }),
    ...overrides,
  }) as unknown as StorageService;

const makeService = (repoOverrides: Record<string, unknown> = {}, storage?: StorageService) =>
  new UsersService(
    { findById: async () => fullUser, ...repoOverrides } as unknown as UserRepo,
    storage ?? makeStorage(),
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

describe('UsersService.updateProfile', () => {
  test('only provided fields are updated', async () => {
    let updated: Record<string, unknown> = {};
    const service = makeService({
      update: async (_id: string, data: Record<string, unknown>) => {
        updated = data;
        return fullUser;
      },
    });

    await service.updateProfile('user-1', { fullName: 'New Name' } as never);

    expect(updated).toEqual({ fullName: 'New Name' });
  });

  test('missing user throws NotFound', async () => {
    const service = makeService({ findById: async () => null });

    await expect(service.updateProfile('ghost', {} as never)).rejects.toThrow(NotFoundException);
  });
});

describe('UsersService.updateAvatar', () => {
  const file = { buffer: Buffer.from('img'), mimetype: 'image/png' } as never;

  test('deletes the old key avatar and persists the uploaded key', async () => {
    let deletedKey: string | undefined;
    let uploadArgs: Record<string, unknown> = {};
    const storage = makeStorage({
      deleteFile: async (key: string) => {
        deletedKey = key;
      },
      uploadImage: async (args: Record<string, unknown>) => {
        uploadArgs = args;
        return { key: 'avatars/user-1/new.webp', url: 'https://cdn.test/avatars/user-1/new.webp' };
      },
    });
    let updated: Record<string, unknown> = {};
    const service = makeService(
      {
        findById: async () => ({ ...fullUser, avatar: 'avatars/user-1/old.webp' }),
        update: async (_id: string, data: Record<string, unknown>) => {
          updated = data;
          return fullUser;
        },
      },
      storage,
    );

    await service.updateAvatar('user-1', file);

    expect(deletedKey).toBe('avatars/user-1/old.webp');
    expect(uploadArgs).toMatchObject({ width: 400, height: 400, contentType: 'image/png' });
    expect(String(uploadArgs.key)).toMatch(/^avatars\/user-1\//);
    expect(updated).toEqual({ avatar: 'avatars/user-1/new.webp' });
  });

  test('an external (OAuth) avatar URL is not deleted', async () => {
    let deleted = false;
    const storage = makeStorage({
      deleteFile: async () => {
        deleted = true;
      },
    });
    const service = makeService(
      {
        findById: async () => ({ ...fullUser, avatar: 'https://accounts.google.com/pic' }),
        update: async () => fullUser,
      },
      storage,
    );

    await service.updateAvatar('user-1', file);

    expect(deleted).toBe(false);
  });

  test('a failing old-avatar delete never blocks the upload', async () => {
    const storage = makeStorage({
      deleteFile: async () => {
        throw new Error('s3 down');
      },
    });
    let persisted = false;
    const service = makeService(
      {
        update: async () => {
          persisted = true;
          return fullUser;
        },
      },
      storage,
    );

    await service.updateAvatar('user-1', file);

    expect(persisted).toBe(true);
  });

  test('users without an avatar skip deletion entirely', async () => {
    const storage = makeStorage({
      deleteFile: async () => {
        throw new Error('must not delete anything');
      },
    });
    const service = makeService(
      {
        findById: async () => ({ ...fullUser, avatar: null }),
        update: async () => ({ ...fullUser, avatar: 'https://example.com/new.webp' }),
      },
      storage,
    );

    const result = await service.updateAvatar('user-1', file);

    expect(result.avatar).toBe('https://example.com/new.webp');
  });
});

describe('UsersService.updateUser', () => {
  test('admin-managed fields pass through to the repo', async () => {
    let updated: Record<string, unknown> = {};
    const service = makeService({
      update: async (_id: string, data: Record<string, unknown>) => {
        updated = data;
        return fullUser;
      },
    });

    await service.updateUser('user-1', { role: 'ADMIN', phone: '+84987654321' } as never);

    expect(updated).toEqual({ role: 'ADMIN', phone: '+84987654321' });
  });
});

describe('UsersService.deleteUser', () => {
  test('removes the user and reports success', async () => {
    let removedId: string | undefined;
    const service = makeService({
      remove: async (id: string) => {
        removedId = id;
      },
    });

    const result = await service.deleteUser('user-1');

    expect(result).toEqual({ success: true });
    expect(removedId).toBe('user-1');
  });

  test('missing user throws NotFound', async () => {
    const service = makeService({ findById: async () => null });

    await expect(service.deleteUser('ghost')).rejects.toThrow(NotFoundException);
  });
});

describe('UsersService reads & admin listings', () => {
  test('getOwnProfile returns the user or throws NotFound', async () => {
    const ok = makeService();
    expect((await ok.getOwnProfile('user-1')).id).toBe('user-1');

    const missing = makeService({ findById: async () => null });
    await expect(missing.getOwnProfile('ghost')).rejects.toThrow(NotFoundException);
  });

  test('getUserById throws NotFound for unknown ids', async () => {
    const service = makeService({ findById: async () => null });

    await expect(service.getUserById('ghost')).rejects.toThrow(NotFoundException);
  });

  test('listUsers computes total pages', async () => {
    const service = makeService({
      list: async () => ({ users: [{ ...fullUser }], total: 11 }),
    });

    const result = await service.listUsers(2, 10, 'USER' as never);

    expect(result.pagination).toEqual({ page: 2, limit: 10, total: 11, totalPages: 2 });
    expect(result.users[0].email).toBe('user@example.com');
  });

  test('searchUsers projects the public shape for non-admins', async () => {
    const service = makeService({
      searchByKeyword: async () => ({ users: [fullUser], total: 1 }),
    });

    const result = await service.searchUsers('test', 1, 10, 'USER' as never);

    expect(result.users).toEqual([
      { id: 'user-1', fullName: 'Test User', avatar: 'https://example.com/a.webp' },
    ]);
  });

  test('searchUsers hands private rows to admins untouched', async () => {
    let sawAdminFlag: boolean | undefined;
    const service = makeService({
      searchByKeyword: async (_q: string, _p: number, _l: number, isAdmin: boolean) => {
        sawAdminFlag = isAdmin;
        return { users: [fullUser], total: 1 };
      },
    });

    const result = await service.searchUsers('test', 1, 10, 'ADMIN' as never);

    expect(sawAdminFlag).toBe(true);
    expect((result.users[0] as typeof fullUser).email).toBe('user@example.com');
  });
});

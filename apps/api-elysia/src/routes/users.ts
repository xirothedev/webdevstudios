import { Elysia } from 'elysia';
import type { User } from '../generated/prisma/client';
import { ApiError } from '../lib/errors';
import { db } from '../lib/prisma';
import { bindBody } from '../lib/validate';
import { requireAuth, optionalAuth } from '../lib/auth';
import { goTime, paging } from '../lib/util';
import { putObject, resolveMediaUrl, storageEnabled } from '../lib/storage';

function privateDTO(u: User) {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    phone: u.phone,
    avatar: u.avatar,
    role: u.role,
    emailVerified: u.emailVerified,
    phoneVerified: u.phoneVerified,
    mfaEnabled: u.mfaEnabled,
    createdAt: goTime(u.createdAt),
    updatedAt: goTime(u.updatedAt),
  };
}

// mirrors users.replyErr: a missing principal is 401 (not 404).
async function byID(id: string): Promise<User> {
  const u = await db().user.findUnique({ where: { id } });
  if (u === null) throw new ApiError(401, 'User not found');
  return u;
}

export const users = new Elysia()
  .get('/users/me', async ({ request, cookie }) => {
    const auth = await requireAuth({ request, cookie });
    const u = await byID(auth.user.id);
    return privateDTO(u);
  })
  .patch('/users/profile', async ({ request, cookie, body }) => {
    const auth = await requireAuth({ request, cookie });
    const in1 = bindBody<{ fullName?: string; phone?: string }>(body as Record<string, unknown>, {
      FullName: { type: 'string', omitempty: true, minLen: 1, maxLen: 100 },
      Phone: { type: 'string', omitempty: true, maxLen: 15 },
    });
    const data: Record<string, unknown> = {};
    if (in1.fullName !== undefined && in1.fullName !== null) data.fullName = in1.fullName;
    if (in1.phone !== undefined && in1.phone !== null) data.phone = in1.phone;
    if (Object.keys(data).length > 0) {
      await db().user.update({ where: { id: auth.user.id }, data });
    }
    const u = await byID(auth.user.id);
    return privateDTO(u);
  })
  .patch('/users/avatar', async ({ request, cookie }) => {
    const auth = await requireAuth({ request, cookie });
    if (!storageEnabled()) {
      throw new ApiError(501, 'avatar upload requires R2_* env vars (storage)');
    }
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File) || file.size === 0) {
      throw new ApiError(400, 'file is required');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new ApiError(400, 'File too large. Max 5MB');
    }
    let ext: string;
    switch (file.type) {
      case 'image/jpeg':
        ext = 'jpg';
        break;
      case 'image/png':
        ext = 'png';
        break;
      case 'image/webp':
        ext = 'webp';
        break;
      default:
        throw new ApiError(400, 'Only jpg, png, webp images are allowed');
    }
    const buf = new Uint8Array(await file.arrayBuffer());
    const key = `avatars/${auth.user.id}/${Math.floor(Date.now() / 1000)}.${ext}`;
    await putObject(key, buf, file.type).catch((e: Error) => {
      throw new ApiError(500, e.message);
    });
    await db().user.update({ where: { id: auth.user.id }, data: { avatar: key } });
    const u = await db().user.findUnique({ where: { id: auth.user.id } });
    if (u === null) throw new ApiError(500, 'user verify failed');
    return { ...privateDTO(u), avatar: resolveMediaUrl(u.avatar ?? '') };
  })
  // ponytail: mirrors Go — the list route is auth-only with no admin check.
  .get('/users', async ({ request, cookie, query }) => {
    await requireAuth({ request, cookie });
    const { page, limit } = paging(query.page, query.limit, 100);
    const where = query.role && query.role !== '' ? { role: query.role as User['role'] } : {};
    const total = await db().user.count({ where });
    const rows = await db().user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      users: rows.map(privateDTO),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  })
  .get('/users/:id', async ({ request, cookie, params }) => {
    const viewer = await optionalAuth({ request, cookie });
    const u = await db().user.findUnique({ where: { id: params.id! } });
    if (u === null) {
      throw new ApiError(404, `User with id ${params.id} not found`);
    }
    if (viewer !== null && (viewer.user.id === u.id || viewer.user.role === 'ADMIN')) {
      return privateDTO(u);
    }
    return { id: u.id, fullName: u.fullName, avatar: u.avatar };
  });

export default users;

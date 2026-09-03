import { HttpApiBuilder } from 'effect/unstable/httpapi';

import { api } from '../api';
import { wrap, bodyOf } from '../lib/http';
import type { User } from '../generated/prisma/client';
import type { DatabaseClient } from '../lib/prisma';
import { ApiError } from '../lib/errors';
import { bindBody } from '../lib/validate';
import { requireAuth, optionalAuth } from '../lib/auth';
import { goTime, paging } from '../lib/util';
import { putObject, resolveMediaUrl, storageEnabled } from '../lib/storage';

const VALID_ROLES = ['ADMIN', 'CUSTOMER'] as const;

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
async function byID(db: DatabaseClient, id: string): Promise<User> {
  const u = await db.user.findUnique({ where: { id } });
  if (u === null) throw new ApiError(401, 'User not found');
  return u;
}

export const usersHandlers = HttpApiBuilder.group(api, 'users', (h) =>
  h
    .handle(
      'me',
      wrap(true, async (ctx) => {
        const auth = await requireAuth(ctx);
        return privateDTO(auth.user);
      }),
    )
    .handle(
      'updateProfile',
      wrap(true, async (ctx) => {
        const auth = await requireAuth(ctx);
        const in1 = bindBody<{ fullName?: string; phone?: string }>(await bodyOf(ctx), {
          FullName: { type: 'string', omitempty: true, minLen: 1, maxLen: 100 },
          Phone: { type: 'string', omitempty: true, maxLen: 15 },
        });
        const data: Record<string, unknown> = {};
        if (in1.fullName !== undefined && in1.fullName !== null) data.fullName = in1.fullName;
        if (in1.phone !== undefined && in1.phone !== null) data.phone = in1.phone;
        if (Object.keys(data).length > 0) {
          await ctx.db.user.update({ where: { id: auth.user.id }, data });
        }
        const u = await byID(ctx.db, auth.user.id);
        return privateDTO(u);
      }),
    )
    .handle(
      'updateAvatar',
      wrap(true, async (ctx) => {
        const auth = await requireAuth(ctx);
        if (!storageEnabled()) {
          throw new ApiError(501, 'avatar upload requires R2_* env vars (storage)');
        }
        const form = await ctx.http.formData();
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
        const u = await ctx.db.user.update({ where: { id: auth.user.id }, data: { avatar: key } });
        return { ...privateDTO(u), avatar: resolveMediaUrl(u.avatar ?? '') };
      }),
    )
    .handle(
      // ponytail: mirrors Go — the list route is auth-only with no admin check.
      'listUsers',
      wrap(true, async (ctx) => {
        await requireAuth(ctx);
        const { page, limit } = paging(ctx.query.page, ctx.query.limit, 100);
        let where: Record<string, unknown> = {};
        if (ctx.query.role && ctx.query.role !== '') {
          if (!(VALID_ROLES as readonly string[]).includes(ctx.query.role)) {
            throw new ApiError(400, 'role must be one of ADMIN, CUSTOMER');
          }
          where = { role: ctx.query.role };
        }
        const total = await ctx.db.user.count({ where });
        const rows = await ctx.db.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        });
        return {
          users: rows.map(privateDTO),
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
      }),
    )
    .handle(
      'getUser',
      wrap(true, async (ctx) => {
        const viewer = await optionalAuth(ctx);
        const u = await ctx.db.user.findUnique({ where: { id: ctx.params.id! } });
        if (u === null) {
          throw new ApiError(404, `User with id ${ctx.params.id} not found`);
        }
        if (viewer !== null && (viewer.user.id === u.id || viewer.user.role === 'ADMIN')) {
          return privateDTO(u);
        }
        return { id: u.id, fullName: u.fullName, avatar: u.avatar };
      }),
    ),
);

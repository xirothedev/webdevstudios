import { Schema } from 'effect';
import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup } from 'effect/unstable/httpapi';

import { wrap, bodyOf } from '../lib/http';
import type { BlogPost, User } from '../generated/prisma/client';
import { ApiError } from '../lib/errors';
import type { DatabaseClient } from '../lib/prisma';
import { bindBody } from '../lib/validate';
import { requireAdmin } from '../lib/auth';
import { goTime, newId, paging } from '../lib/util';
import { getObject, putObject, deleteObject, StorageUnavailableError } from '../lib/storage';

type PostRow = BlogPost & { author: User };

function toDTO(p: PostRow, content?: string) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    contentKey: p.contentKey,
    ...(content !== undefined ? { content } : {}),
    contentSize: p.contentSize,
    excerpt: p.excerpt,
    coverImage: p.coverImage,
    author: { id: p.author.id, fullName: p.author.fullName, avatar: p.author.avatar },
    isPublished: p.isPublished,
    publishedAt: goTime(p.publishedAt),
    viewCount: p.viewCount,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    createdAt: goTime(p.createdAt),
    updatedAt: goTime(p.updatedAt),
  };
}

// ponytail: mirrors Go extractExcerpt loosely — first ~200 chars, markdown stripped.
function autoExcerpt(content: string): string {
  let s = content.replace(/[#*`]/g, '').replace(/\n/g, ' ');
  while (s.length > 3 && s[0] === ' ') s = s.slice(1);
  if (s.length > 200) s = s.slice(0, 200);
  return s;
}

// Go uses plain `publishedAt DESC` — Postgres nulls-first, so draft posts sort first.
const ORDER = { publishedAt: 'desc' as const };

async function fetchPost(
  db: DatabaseClient,
  idOrSlug: 'id' | 'slug',
  value: string,
): Promise<PostRow> {
  const p = await db.blogPost.findFirst({
    where: idOrSlug === 'id' ? { id: value } : { slug: value },
    include: { author: true },
  });
  if (p === null) {
    throw new ApiError(
      404,
      idOrSlug === 'slug' ? `Blog post with slug "${value}" not found` : 'Blog post not found',
    );
  }
  return p;
}

const IdParams = Schema.Struct({ id: Schema.String });
const SlugParams = Schema.Struct({ slug: Schema.String });

// Field order mirrors toDTO — the success codec renders the 200 response body.
const PostDto = Schema.Struct({
  id: Schema.String,
  slug: Schema.String,
  title: Schema.String,
  contentKey: Schema.String,
  content: Schema.optional(Schema.String),
  contentSize: Schema.NullOr(Schema.Number),
  excerpt: Schema.NullOr(Schema.String),
  coverImage: Schema.NullOr(Schema.String),
  author: Schema.Struct({
    id: Schema.String,
    fullName: Schema.NullOr(Schema.String),
    avatar: Schema.NullOr(Schema.String),
  }),
  isPublished: Schema.Boolean,
  publishedAt: Schema.NullOr(Schema.String),
  viewCount: Schema.Number,
  metaTitle: Schema.NullOr(Schema.String),
  metaDescription: Schema.NullOr(Schema.String),
  createdAt: Schema.NullOr(Schema.String),
  updatedAt: Schema.NullOr(Schema.String),
});

const PostListDto = Schema.Struct({ posts: Schema.Array(PostDto), total: Schema.Number });
const SuccessDto = Schema.Struct({ success: Schema.Boolean });

export const blogGroup = HttpApiGroup.make('blog').add(
  HttpApiEndpoint.get('listPosts', '/v1/blog/posts', { success: PostListDto }),
  HttpApiEndpoint.get('searchPosts', '/v1/blog/posts/search', { success: PostListDto }),
  HttpApiEndpoint.get('listAllPosts', '/v1/blog/posts/admin/all', { success: PostListDto }),
  HttpApiEndpoint.post('createPost', '/v1/blog/posts', { success: PostDto }),
  HttpApiEndpoint.patch('updatePost', '/v1/blog/posts/:id', { success: PostDto, params: IdParams }),
  HttpApiEndpoint.delete('deletePost', '/v1/blog/posts/:id', {
    success: SuccessDto,
    params: IdParams,
  }),
  HttpApiEndpoint.get('getPost', '/v1/blog/posts/:slug', { success: PostDto, params: SlugParams }),
);

export const blogLocal = HttpApi.make('api-effect').add(blogGroup);

export const blogHandlers = HttpApiBuilder.group(blogLocal, 'blog', (h) =>
  h
    .handle(
      'listPosts',
      wrap(true, async (ctx) => {
        // ponytail: Go blog paging reads `pageSize`, not `limit`.
        const { page, limit } = paging(ctx.query.page, ctx.query.pageSize, 100);
        const where = { isPublished: true };
        const total = await ctx.db.blogPost.count({ where });
        const rows = await ctx.db.blogPost.findMany({
          where,
          include: { author: true },
          orderBy: ORDER,
          skip: (page - 1) * limit,
          take: limit,
        });
        return { posts: rows.map((r) => toDTO(r)), total };
      }),
    )
    .handle(
      'searchPosts',
      wrap(true, async (ctx) => {
        const q = ctx.query.q;
        if (!q) throw new ApiError(400, 'q is required');
        const { page, limit } = paging(ctx.query.page, ctx.query.pageSize, 100);
        const where = {
          isPublished: true,
          OR: [
            { title: { mode: 'insensitive' as const, contains: q } },
            { excerpt: { mode: 'insensitive' as const, contains: q } },
          ],
        };
        const total = await ctx.db.blogPost.count({ where });
        const rows = await ctx.db.blogPost.findMany({
          where,
          include: { author: true },
          orderBy: ORDER,
          skip: (page - 1) * limit,
          take: limit,
        });
        return { posts: rows.map((r) => toDTO(r)), total };
      }),
    )
    .handle(
      'listAllPosts',
      wrap(true, async (ctx) => {
        await requireAdmin(ctx);
        const { page, limit } = paging(ctx.query.page, ctx.query.pageSize, 100);
        const total = await ctx.db.blogPost.count({});
        const rows = await ctx.db.blogPost.findMany({
          include: { author: true },
          orderBy: ORDER,
          skip: (page - 1) * limit,
          take: limit,
        });
        return { posts: rows.map((r) => toDTO(r)), total };
      }),
    )
    .handle(
      'createPost',
      wrap(true, async (ctx) => {
        const auth = await requireAdmin(ctx);
        const in1 = bindBody(await bodyOf(ctx), {
          Slug: { type: 'string', required: true },
          Title: { type: 'string', required: true, maxLen: 255 },
          Content: { type: 'string', required: true },
          Excerpt: { type: 'string' },
          CoverImage: { type: 'string' },
          IsPublished: { type: 'boolean' },
          MetaTitle: { type: 'string' },
          MetaDescription: { type: 'string' },
        });
        const slug = in1.slug;
        const dup = await ctx.db.blogPost.count({ where: { slug } });
        if (dup > 0) {
          throw new ApiError(409, `Blog post with slug "${slug}" already exists`);
        }
        let excerpt = autoExcerpt(in1.content);
        if (typeof in1.excerpt === 'string') excerpt = in1.excerpt;
        const published = in1.isPublished === true;
        const id = newId();
        const created = await ctx.db.blogPost.create({
          data: {
            id,
            slug,
            title: in1.title,
            contentKey: '',
            contentSize: in1.content.length,
            excerpt,
            coverImage: in1.coverImage ?? null,
            authorId: auth.user.id,
            isPublished: published,
            publishedAt: published ? new Date() : null,
            metaTitle: in1.metaTitle ?? null,
            metaDescription: in1.metaDescription ?? null,
          },
          include: { author: true },
        });
        const key = `blog/posts/${id}/content.md`;
        try {
          await putObject(key, new TextEncoder().encode(in1.content), 'text/markdown');
        } catch (e) {
          await ctx.db.blogPost.delete({ where: { id } }).catch(() => {});
          throw e instanceof StorageUnavailableError
            ? new ApiError(501, e.message)
            : new ApiError(500, e instanceof Error ? e.message : String(e));
        }
        await ctx.db.blogPost.update({ where: { id }, data: { contentKey: key } });
        ctx.setStatus(201);
        return toDTO({ ...created, contentKey: key });
      }),
    )
    .handle(
      'updatePost',
      wrap(true, async (ctx) => {
        await requireAdmin(ctx);
        const p = await fetchPost(ctx.db, 'id', ctx.param('id'));
        const in1 = bindBody(await bodyOf(ctx), {
          Title: { type: 'string' },
          Content: { type: 'string' },
          Excerpt: { type: 'string' },
          CoverImage: { type: 'string' },
          IsPublished: { type: 'boolean' },
          MetaTitle: { type: 'string' },
          MetaDescription: { type: 'string' },
        });
        // Go: all pointer fields; null keys are skipped like missing ones.
        const data: Record<string, unknown> = {};
        if (typeof in1.title === 'string') data.title = in1.title;
        if (typeof in1.excerpt === 'string') data.excerpt = in1.excerpt;
        if (typeof in1.coverImage === 'string') data.coverImage = in1.coverImage;
        if (typeof in1.metaTitle === 'string') data.metaTitle = in1.metaTitle;
        if (typeof in1.metaDescription === 'string') data.metaDescription = in1.metaDescription;
        if (in1.isPublished === true && p.publishedAt === null) data.publishedAt = new Date();
        if (typeof in1.isPublished === 'boolean') data.isPublished = in1.isPublished;
        if (Object.keys(data).length > 0) {
          await ctx.db.blogPost.update({ where: { id: p.id }, data });
        }
        if (typeof in1.content === 'string') {
          try {
            await putObject(p.contentKey, new TextEncoder().encode(in1.content), 'text/markdown');
          } catch (e) {
            throw e instanceof StorageUnavailableError
              ? new ApiError(501, e.message)
              : new ApiError(500, e instanceof Error ? e.message : String(e));
          }
          await ctx.db.blogPost.update({
            where: { id: p.id },
            data: { contentSize: in1.content.length },
          });
        }
        const fresh = await fetchPost(ctx.db, 'id', p.id);
        return toDTO(fresh);
      }),
    )
    .handle(
      'deletePost',
      wrap(true, async (ctx) => {
        await requireAdmin(ctx);
        const p = await fetchPost(ctx.db, 'id', ctx.param('id'));
        await ctx.db.blogPost.delete({ where: { id: p.id } });
        void deleteObject(p.contentKey).catch(() => {});
        return { success: true };
      }),
    )
    .handle(
      'getPost',
      wrap(true, async (ctx) => {
        const p = await fetchPost(ctx.db, 'slug', ctx.param('slug'));
        if (ctx.query.includeContent === 'true') {
          let content: string;
          try {
            content = new TextDecoder().decode(await getObject(p.contentKey));
          } catch (e) {
            throw e instanceof StorageUnavailableError
              ? new ApiError(501, 'includeContent requires R2_* env vars')
              : new ApiError(500, e instanceof Error ? e.message : String(e));
          }
          return toDTO(p, content);
        }
        if (p.isPublished) {
          await ctx.db
            .$queryRaw`UPDATE "blog_posts" SET "viewCount" = "viewCount" + 1 WHERE "id" = ${p.id}`;
        }
        return toDTO(p);
      }),
    ),
);

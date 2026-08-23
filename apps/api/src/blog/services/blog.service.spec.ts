import { ConflictException, NotFoundException } from '@nestjs/common';
import { describe, expect, test } from 'bun:test';

import { StorageService } from '@/storage/storage.service';

import { BlogPostRepo } from '../repo';
import { BlogService } from './blog.service';

// ponytail: hand-rolled fakes per repo-seam rule; swap for a builder if this file grows past ~150 lines
const author = { id: 'author-1', fullName: 'Test Author', avatar: null };

const baseRepo = {
  findBySlug: async () => null,
  findById: async () => null,
  findAll: async () => ({ posts: [], total: 0 }),
  search: async () => ({ posts: [], total: 0 }),
  create: async (data: Record<string, unknown>) => ({ id: 'post-1', author, ...data }),
  update: async (id: string, data: Record<string, unknown>) => ({
    id,
    author,
    isPublished: false,
    ...data,
  }),
  delete: async () => {},
  incrementViewCount: async () => ({}),
};

const makeRepo = (overrides: Record<string, unknown> = {}) =>
  ({ ...baseRepo, ...overrides }) as unknown as BlogPostRepo;

const fakeStorage = {
  uploadBlogContent: async (postId: string) => `blog/posts/${postId}/content.md`,
  deleteBlogContent: async () => {},
  getBlogContent: async () => '# stored',
  // ponytail: identity passthrough keeps fixture values observable
  resolveMediaUrl: (ref: string | null | undefined) => ref ?? null,
} as unknown as StorageService;

const baseCreateDto = {
  slug: 'hello-world',
  title: 'Hello',
  content: '# Hello',
};

describe('BlogService', () => {
  test('createPost rejects duplicate slugs', async () => {
    const repo = makeRepo({ findBySlug: async () => ({ id: 'exists' }) });
    const service = new BlogService(repo, fakeStorage);

    expect(service.createPost('author-1', baseCreateDto as never)).rejects.toThrow(
      ConflictException,
    );
  });

  test('createPost stamps publishedAt only when publishing', async () => {
    let created: Record<string, unknown> = {};
    const repo = makeRepo({
      findBySlug: async () => null,
      create: async (data: Record<string, unknown>) => {
        created = data;
        return { id: 'post-1', ...data };
      },
    });
    const service = new BlogService(repo, fakeStorage);

    await service.createPost('author-1', {
      ...baseCreateDto,
      isPublished: true,
    } as never);
    expect(created.publishedAt).toBeInstanceOf(Date);
    expect(created.contentSize).toBeGreaterThan(0);
    expect(created.excerpt).toBe('Hello');

    await service.createPost('author-1', baseCreateDto as never);
    expect(created.publishedAt).toBeNull();
  });

  test('createPost keys content by post id, not slug', async () => {
    let uploadedId: string | undefined;
    let secondWrite: Record<string, unknown> = {};
    const repo = makeRepo({
      create: async (data: Record<string, unknown>) => ({ id: 'post-1', author, ...data }),
      update: async (_id: string, data: Record<string, unknown>) => {
        secondWrite = data;
        return { id: 'post-1', author, ...data };
      },
    });
    const storage = {
      ...fakeStorage,
      uploadBlogContent: async (postId: string) => {
        uploadedId = postId;
        return `blog/posts/${postId}/content.md`;
      },
    } as unknown as StorageService;
    const service = new BlogService(repo, storage);

    await service.createPost('author-1', baseCreateDto as never);

    expect(uploadedId).toBe('post-1');
    expect(secondWrite.contentKey).toBe('blog/posts/post-1/content.md');
  });

  test('publishPost skips update when already published', async () => {
    let updated = false;
    const repo = makeRepo({
      findById: async () => ({ id: 'p1', author, isPublished: true }),
      update: async () => {
        updated = true;
        return {};
      },
    });
    const service = new BlogService(repo, fakeStorage);

    await service.publishPost('p1');
    expect(updated).toBe(false);
  });

  test('getPostBySlug counts a view for published posts without content fetch', async () => {
    let viewed = false;
    let fetchedContent = false;
    const repo = makeRepo({
      findBySlug: async () => ({ id: 'p1', author, isPublished: true, contentKey: 'u' }),
      incrementViewCount: async () => {
        viewed = true;
        return {};
      },
    });
    const storage = {
      ...fakeStorage,
      getBlogContent: async () => {
        fetchedContent = true;
        return 'c';
      },
    } as unknown as StorageService;
    const service = new BlogService(repo, storage);

    await service.getPostBySlug('slug');
    expect(viewed).toBe(true);
    expect(fetchedContent).toBe(false);
  });

  test('updatePost throws NotFound for missing id', async () => {
    const service = new BlogService(makeRepo({}), fakeStorage);

    expect(service.updatePost('missing', { title: 'x' } as never)).rejects.toThrow(
      NotFoundException,
    );
  });
});

describe('BlogService.getPostById', () => {
  test('missing id throws NotFound', async () => {
    const service = new BlogService(makeRepo({ findById: async () => null }), fakeStorage);

    await expect(service.getPostById('missing')).rejects.toThrow(NotFoundException);
  });
});

describe('BlogService.withContent', () => {
  test('storage miss surfaces as NotFound', async () => {
    const storage = {
      ...fakeStorage,
      getBlogContent: async () => {
        throw new Error('s3 404');
      },
    } as unknown as StorageService;
    const repo = makeRepo({ findById: async () => ({ id: 'p1', contentKey: 'u' }) });
    const service = new BlogService(repo, storage);

    await expect(service.getPostById('p1', { includeContent: true } as never)).rejects.toThrow(
      NotFoundException,
    );
  });
});

describe('BlogService.deletePost', () => {
  test('missing id throws NotFound without deleting', async () => {
    let deleted = false;
    const repo = makeRepo({
      findById: async () => null,
      delete: async () => {
        deleted = true;
      },
    });
    const service = new BlogService(repo, fakeStorage);

    await expect(service.deletePost('missing')).rejects.toThrow(NotFoundException);
    expect(deleted).toBe(false);
  });
});

describe('BlogService.publishPost', () => {
  test('unpublished posts get stamped and published', async () => {
    let updated: Record<string, unknown> = {};
    const repo = makeRepo({
      findById: async () => ({ id: 'p1', isPublished: false }),
      update: async (_id: string, data: Record<string, unknown>) => {
        updated = data;
        return { id: 'p1', author };
      },
    });
    const service = new BlogService(repo, fakeStorage);

    await service.publishPost('p1');

    expect(updated.isPublished).toBe(true);
    expect(updated.publishedAt).toBeInstanceOf(Date);
  });
});

describe('BlogService list passthroughs', () => {
  test('listPublishedPosts defaults to page 1 pageSize 10', async () => {
    let sawArgs: Record<string, unknown> = {};
    const repo = makeRepo({
      findAll: async (args: Record<string, unknown>) => {
        sawArgs = args;
        return { posts: [], total: 0 };
      },
    });
    const service = new BlogService(repo, fakeStorage);

    const result = await service.listPublishedPosts({} as never);

    expect(sawArgs).toEqual({ isPublished: true, page: 1, pageSize: 10 });
    expect(result).toEqual({ items: [], total: 0 });
  });

  test('listAllPosts defaults to page 1 pageSize 20 without the published filter', async () => {
    let sawArgs: Record<string, unknown> = {};
    const repo = makeRepo({
      findAll: async (args: Record<string, unknown>) => {
        sawArgs = args;
        return { posts: [], total: 0 };
      },
    });
    const service = new BlogService(repo, fakeStorage);

    await service.listAllPosts({} as never);

    expect(sawArgs).toEqual({ page: 1, pageSize: 20 });
  });

  test('searchPosts forwards the query with defaults', async () => {
    let sawQuery: string | undefined;
    let sawArgs: Record<string, unknown> = {};
    const repo = makeRepo({
      search: async (q: string, args: Record<string, unknown>) => {
        sawQuery = q;
        sawArgs = args;
        return { posts: [], total: 0 };
      },
    });
    const service = new BlogService(repo, fakeStorage);

    await service.searchPosts({ q: 'hello', page: 3 } as never);

    expect(sawQuery).toBe('hello');
    expect(sawArgs).toEqual({ page: 3, pageSize: 10 });
  });
});

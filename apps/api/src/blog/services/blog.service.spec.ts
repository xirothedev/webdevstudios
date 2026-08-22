import { ConflictException, NotFoundException } from '@nestjs/common';
import { describe, expect, test } from 'bun:test';

import { StorageService } from '@/storage/storage.service';

import { BlogPostRepo } from '../repo';
import { BlogService } from './blog.service';

// ponytail: hand-rolled fakes per repo-seam rule; swap for a builder if this file grows past ~150 lines
const baseRepo = {
  findBySlug: async () => null,
  findById: async () => null,
  findAll: async () => ({ posts: [], total: 0 }),
  search: async () => ({ posts: [], total: 0 }),
  create: async (data: Record<string, unknown>) => ({ id: 'post-1', ...data }),
  update: async (id: string, data: Record<string, unknown>) => ({
    id,
    isPublished: false,
    ...data,
  }),
  delete: async () => {},
  incrementViewCount: async () => ({}),
};

const makeRepo = (overrides: Record<string, unknown> = {}) =>
  ({ ...baseRepo, ...overrides }) as unknown as BlogPostRepo;

const fakeStorage = {
  uploadBlogContent: async () => 'https://r2.example.com/content.md',
  deleteBlogContent: async () => {},
  getBlogContent: async () => '# stored',
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

  test('publishPost skips update when already published', async () => {
    let updated = false;
    const repo = makeRepo({
      findById: async () => ({ id: 'p1', isPublished: true }),
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
      findBySlug: async () => ({ id: 'p1', isPublished: true, contentUrl: 'u' }),
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

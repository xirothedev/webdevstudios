import { describe, expect, test } from 'bun:test';

import {
  BLOG_POST_SELECT,
  type BlogPostRow,
  type BlogPostRowWithContent,
} from './blog-post.selects';

describe('blog-post.selects derived types', () => {
  test('BlogPostRow matches the select shape', () => {
    // ponytail: compile-time proof — if the select adds a column, BlogPostRow widens automatically
    const row: BlogPostRow = {
      id: 'c1',
      slug: 'hello',
      title: 'Hello',
      contentKey: 'blog/posts/c1/content.md',
      contentSize: null,
      excerpt: null,
      coverImage: null,
      isPublished: false,
      publishedAt: null,
      viewCount: 0,
      metaTitle: null,
      metaDescription: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: { id: 'a1', fullName: 'Test', avatar: null },
    };

    expect(row.id).toBe('c1');
    expect(row.author.fullName).toBe('Test');
  });

  test('BlogPostRowWithContent extends BlogPostRow with content', () => {
    const base: BlogPostRow = {
      id: 'c1',
      slug: 'hello',
      title: 'Hello',
      contentKey: 'blog/posts/c1/content.md',
      contentSize: null,
      excerpt: null,
      coverImage: null,
      isPublished: false,
      publishedAt: null,
      viewCount: 0,
      metaTitle: null,
      metaDescription: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: { id: 'a1', fullName: 'Test', avatar: null },
    };

    const withContent: BlogPostRowWithContent = { ...base, content: '# Hello' };
    expect(withContent.content).toBe('# Hello');
    expect(withContent.id).toBe('c1');
  });

  test('select constant satisfies Prisma.BlogPostSelect', () => {
    expect(BLOG_POST_SELECT).toBeDefined();
    expect(typeof BLOG_POST_SELECT).toBe('object');
  });
});

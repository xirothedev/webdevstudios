/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/// <reference types="node" />

/**
 * One-off migration companion for ticket #24 (keys-not-URLs cutover).
 * Rewrites stored full public URLs to R2 object keys:
 *   - blog_posts.contentKey: canonicalized to blog/posts/{id}/content.md
 *   - blog_posts.coverImage: public-url prefix stripped when it matches R2_PUBLIC_URL/R2_ENDPOINT
 *   - users.avatar:          public-url prefix stripped when it matches R2_PUBLIC_URL/R2_ENDPOINT
 * External absolute URLs (e.g. OAuth pictures) and values that are already keys are left alone,
 * so the script is safe to re-run.
 *
 * Usage: bun scripts/rewrite-media-urls-to-keys.ts
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const publicUrl = process.env.R2_PUBLIC_URL || process.env.R2_ENDPOINT;
const base = publicUrl?.replace(/\/$/, '');

const counts = {
  contentKeysCanonicalized: 0,
  coverImagesRewritten: 0,
  avatarsRewritten: 0,
  alreadyKeys: 0,
};

function stripBase(value: string): string | null {
  if (!base || !value.startsWith(`${base}/`)) return null;
  return value.slice(base.length + 1);
}

async function main() {
  console.log('Rewriting stored media URLs to R2 keys...');
  if (!base) {
    console.warn(
      'R2_PUBLIC_URL/R2_ENDPOINT not set: cover images and avatars will not be rewritten.',
    );
  }

  const posts = await prisma.blogPost.findMany({
    select: { id: true, contentKey: true, coverImage: true },
  });

  for (const post of posts) {
    const data: { contentKey?: string; coverImage?: string | null } = {};

    // Content keys have a deterministic shape, so URLs can be canonicalized even after a CDN rename.
    const contentCanonical = `blog/posts/${post.id}/content.md`;
    if (post.contentKey !== contentCanonical) {
      if (!post.contentKey.includes('://')) {
        counts.alreadyKeys++;
      }
      data.contentKey = contentCanonical;
      counts.contentKeysCanonicalized++;
    }

    const cover = post.coverImage;
    const coverKey = cover ? (cover.includes('://') ? stripBase(cover) : null) : null;
    if (cover && coverKey) {
      data.coverImage = coverKey;
      counts.coverImagesRewritten++;
    }

    if (Object.keys(data).length > 0) {
      await prisma.blogPost.update({ where: { id: post.id }, data });
    }
  }

  if (base) {
    const users = await prisma.user.findMany({
      where: { avatar: { startsWith: `${base}/` } },
      select: { id: true, avatar: true },
    });

    for (const user of users) {
      const key = stripBase(user.avatar!);
      if (!key) continue;
      await prisma.user.update({ where: { id: user.id }, data: { avatar: key } });
      counts.avatarsRewritten++;
    }
  }

  console.log('\n✅ Rewrite completed!');
  console.log(JSON.stringify(counts, null, 2));
}

main()
  .catch((e) => {
    console.error('Error rewriting media URLs:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

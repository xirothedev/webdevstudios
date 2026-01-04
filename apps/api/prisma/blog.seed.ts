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

import { PrismaPg } from '@prisma/adapter-pg';

import { allBlogPosts } from '../data/blog-posts';
import { BlogPost, PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  console.log('Starting blog seed...');

  // Find admin user
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@wds.org' },
  });

  if (!adminUser) {
    console.error('Admin user not found. Please run user.seed.ts first.');
    process.exit(1);
  }

  console.log(`Found admin user: ${adminUser.email} (${adminUser.id})`);

  // Clean existing blog posts (optional - comment out if you want to keep existing posts)
  const existingPostsCount = await prisma.blogPost.count();
  if (existingPostsCount > 0) {
    console.log(`Found ${existingPostsCount} existing blog posts. Deleting...`);
    await prisma.blogComment.deleteMany({});
    await prisma.blogPost.deleteMany({});
    console.log('Cleaned existing blog posts.');
  }

  // Create blog posts
  const createdPosts: BlogPost[] = [];
  const now = new Date();

  for (let i = 0; i < allBlogPosts.length; i++) {
    const postData = allBlogPosts[i];
    const publishedAt = new Date(now.getTime() - i * 24 * 60 * 60 * 1000); // Stagger dates

    // For seed purposes, we'll use a relative path as contentUrl
    // This will be treated as a key directly by extractKeyFromUrl
    // Format matches uploadBlogContent: blog/posts/{slug}/content.md
    const contentUrl = `blog/posts/${postData.slug}/content.md`;
    const contentSize = Buffer.from(postData.content, 'utf-8').length;

    const post = await prisma.blogPost.create({
      data: {
        slug: postData.slug,
        title: postData.title,
        contentUrl,
        contentSize,
        excerpt: postData.excerpt,
        coverImage: null, // Can be added later
        authorId: adminUser.id,
        isPublished: postData.isPublished,
        publishedAt: postData.isPublished ? publishedAt : null,
        viewCount: Math.floor(Math.random() * 1000), // Random view count
        metaTitle: postData.metaTitle,
        metaDescription: postData.metaDescription,
      },
    });

    createdPosts.push(post);
    console.log(`Created blog post: ${post.title} (${post.slug})`);
  }

  console.log('\n✅ Blog seed completed successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`- Author: ${adminUser.email}`);
  console.log(`- Total posts: ${createdPosts.length}`);
  console.log(
    `- Published: ${createdPosts.filter((p) => p.isPublished).length}`
  );
  console.log(`- Drafts: ${createdPosts.filter((p) => !p.isPublished).length}`);
}

main()
  .catch((e) => {
    console.error('Error during blog seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

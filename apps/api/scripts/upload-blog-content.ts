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
 * Script to upload blog post content to R2 after seeding
 * Run this after running blog.seed.ts to upload actual content to R2
 *
 * Usage: npx tsx scripts/upload-blog-content.ts
 */

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { PrismaPg } from '@prisma/adapter-pg';

import { allBlogPosts } from '../data/blog-posts';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// Initialize S3 client for R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;

async function main() {
  console.log('Starting blog content upload to R2...');

  if (!BUCKET_NAME || !process.env.R2_ENDPOINT) {
    console.error(
      'Missing R2 configuration. Please check environment variables.'
    );
    process.exit(1);
  }

  // Get all blog posts
  const posts = await prisma.blogPost.findMany({
    select: {
      id: true,
      slug: true,
      contentUrl: true,
    },
  });

  console.log(`Found ${posts.length} blog posts to process`);

  let uploadedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const post of posts) {
    try {
      // Find corresponding blog post data
      const postData = allBlogPosts.find((p) => p.slug === post.slug);

      if (!postData) {
        console.warn(`⚠️  No data found for post: ${post.slug}`);
        skippedCount++;
        continue;
      }

      // Upload content to R2
      const key = `blog/posts/${post.slug}/content.md`;
      const contentBuffer = Buffer.from(postData.content, 'utf-8');

      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: contentBuffer,
          ContentType: 'text/markdown',
          CacheControl: 'public, max-age=2592000', // 30 days
        })
      );

      // Update contentUrl in database to full R2 URL
      const publicUrl = process.env.R2_PUBLIC_URL || process.env.R2_ENDPOINT;
      const fullUrl = `${publicUrl}/${key}`;

      await prisma.blogPost.update({
        where: { id: post.id },
        data: {
          contentUrl: fullUrl,
          contentSize: contentBuffer.length,
        },
      });

      uploadedCount++;
      console.log(`✅ Uploaded: ${post.slug}`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Error uploading ${post.slug}:`, error);
    }
  }

  console.log('\n✅ Blog content upload completed!');
  console.log(`\n📊 Summary:`);
  console.log(`- Uploaded: ${uploadedCount}`);
  console.log(`- Skipped: ${skippedCount}`);
  console.log(`- Errors: ${errorCount}`);
}

main()
  .catch((e) => {
    console.error('Error during blog content upload:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

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

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BlogPostAuthorDto {
  @ApiProperty({
    description: 'Author ID',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Author full name',
    example: 'John Doe',
  })
  fullName: string | null;

  @ApiPropertyOptional({
    description: 'Author avatar URL',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  avatar: string | null;
}

export class BlogPostDto {
  @ApiProperty({
    description: 'Blog post ID',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Blog post slug',
    example: 'getting-started-with-nextjs',
  })
  slug: string;

  @ApiProperty({
    description: 'Blog post title',
    example: 'Getting Started with Next.js',
  })
  title: string;

  @ApiProperty({
    description: 'R2 URL to markdown content',
    example: 'https://r2.example.com/blog/posts/clx1234567890/content.md',
  })
  contentUrl: string;

  @ApiPropertyOptional({
    description: 'Content size in bytes',
    example: 1024,
    nullable: true,
  })
  contentSize: number | null;

  @ApiPropertyOptional({
    description: 'Blog post excerpt',
    example: 'Learn how to get started with Next.js...',
    nullable: true,
  })
  excerpt: string | null;

  @ApiPropertyOptional({
    description: 'Cover image URL',
    example:
      'https://r2.example.com/blog/images/covers/clx1234567890-cover.webp',
    nullable: true,
  })
  coverImage: string | null;

  @ApiProperty({
    description: 'Author information',
    type: BlogPostAuthorDto,
  })
  author: BlogPostAuthorDto;

  @ApiProperty({
    description: 'Whether post is published',
    example: true,
  })
  isPublished: boolean;

  @ApiPropertyOptional({
    description: 'Publication date',
    example: '2024-01-01T00:00:00.000Z',
    nullable: true,
  })
  publishedAt: Date | null;

  @ApiProperty({
    description: 'View count',
    example: 100,
  })
  viewCount: number;

  @ApiPropertyOptional({
    description: 'SEO meta title',
    example: 'Getting Started with Next.js - WebDev Studios',
    nullable: true,
  })
  metaTitle: string | null;

  @ApiPropertyOptional({
    description: 'SEO meta description',
    example:
      'Learn how to get started with Next.js in this comprehensive guide.',
    nullable: true,
  })
  metaDescription: string | null;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class BlogPostWithContentDto extends BlogPostDto {
  @ApiProperty({
    description: 'Markdown content',
    example: '# Getting Started\n\nThis is the content...',
  })
  content: string;
}

export class BlogPostListResponseDto {
  @ApiProperty({
    description: 'List of blog posts',
    type: [BlogPostDto],
  })
  posts: BlogPostDto[];

  @ApiProperty({
    description: 'Total number of posts',
    example: 10,
  })
  total: number;

  @ApiProperty({
    description: 'Current page',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Page size',
    example: 10,
  })
  pageSize: number;
}

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

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBlogPostDto {
  @ApiPropertyOptional({
    description: 'Blog post title',
    example: 'Getting Started with Next.js',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Markdown content',
    example: '# Getting Started\n\nThis is the updated content...',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    description: 'Blog post excerpt',
    example: 'Learn how to get started with Next.js...',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  excerpt?: string | null;

  @ApiPropertyOptional({
    description: 'Cover image URL',
    example:
      'https://r2.example.com/blog/images/covers/clx1234567890-cover.webp',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  coverImage?: string | null;

  @ApiPropertyOptional({
    description: 'Whether post is published',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'SEO meta title',
    example: 'Getting Started with Next.js - WebDev Studios',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  metaTitle?: string | null;

  @ApiPropertyOptional({
    description: 'SEO meta description',
    example:
      'Learn how to get started with Next.js in this comprehensive guide.',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  metaDescription?: string | null;
}

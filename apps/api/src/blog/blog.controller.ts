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

import { UserRole } from '@prisma/client';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Public, Roles } from '@/common/decorators';
import { RolesGuard } from '@/common/guards';
import { BlogService } from './services/blog.service';
import {
  BlogPostDto,
  BlogPostListResponseDto,
  BlogPostWithContentDto,
  CreateBlogPostDto,
  ListBlogPostsQueryDto,
  SearchBlogPostsQueryDto,
  UpdateBlogPostDto,
} from './dtos';

@ApiTags('Blog')
@Controller('blog/posts')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'List blog posts',
    description: 'Get a paginated list of published blog posts',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog posts retrieved successfully',
    type: BlogPostListResponseDto,
  })
  async listPosts(@Query() queryDto: ListBlogPostsQueryDto): Promise<BlogPostListResponseDto> {
    const result = await this.blogService.listPosts({
      page: queryDto.page ?? 1,
      pageSize: queryDto.pageSize ?? 10,
      publishedOnly: true,
    });
    return { items: result.items, total: result.total } as unknown as BlogPostListResponseDto;
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all blog posts (Admin only)',
    description:
      'Get a paginated list of all blog posts (published and unpublished). Admin only endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog posts retrieved successfully',
    type: BlogPostListResponseDto,
  })
  async listAllPosts(@Query() queryDto: ListBlogPostsQueryDto): Promise<BlogPostListResponseDto> {
    const result = await this.blogService.listPosts({
      page: queryDto.page ?? 1,
      pageSize: queryDto.pageSize ?? 20,
      publishedOnly: false,
    });
    return { items: result.items, total: result.total } as unknown as BlogPostListResponseDto;
  }

  @Get('search')
  @Public()
  @ApiOperation({
    summary: 'Search blog posts',
    description: 'Search published blog posts by title and excerpt',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: BlogPostListResponseDto,
  })
  async searchPosts(@Query() queryDto: SearchBlogPostsQueryDto): Promise<BlogPostListResponseDto> {
    // For now, fallback to list with publishedOnly
    const result = await this.blogService.listPosts({
      page: queryDto.page ?? 1,
      pageSize: queryDto.pageSize ?? 10,
      publishedOnly: true,
    });
    return { items: result.items, total: result.total } as unknown as BlogPostListResponseDto;
  }

  @Get(':slug')
  @Public()
  @ApiOperation({
    summary: 'Get blog post by slug',
    description: 'Get blog post details by slug with optional content',
  })
  @ApiParam({
    name: 'slug',
    description: 'Blog post slug',
    example: 'getting-started-with-nextjs',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog post retrieved successfully',
    type: BlogPostWithContentDto,
  })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async getPostBySlug(@Param('slug') slug: string): Promise<BlogPostDto> {
    return this.blogService.getPostBySlug(slug);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create blog post (Admin only)',
    description: 'Create a new blog post. Admin only endpoint.',
  })
  @ApiResponse({
    status: 201,
    description: 'Blog post created successfully',
    type: BlogPostDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 409, description: 'Conflict - Slug already exists' })
  async createPost(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateBlogPostDto,
  ): Promise<BlogPostDto> {
    return this.blogService.createPost({
      authorId: user.id,
      slug: dto.slug,
      title: dto.title,
      content: dto.content,
      excerpt: dto.excerpt || null,
      coverImage: dto.coverImage || null,
      isPublished: dto.isPublished || false,
      metaTitle: dto.metaTitle || null,
      metaDescription: dto.metaDescription || null,
    });
  }

  @Get('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get blog post by ID (Admin only)',
    description: 'Get blog post details by ID with optional content. Admin only endpoint.',
  })
  @ApiParam({
    name: 'id',
    description: 'Blog post ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog post retrieved successfully',
    type: BlogPostWithContentDto,
  })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async getPostById(@Param('id') id: string): Promise<BlogPostDto> {
    return this.blogService.getPostById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update blog post (Admin only)',
    description: 'Update blog post information. Admin only endpoint.',
  })
  @ApiParam({
    name: 'id',
    description: 'Blog post ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog post updated successfully',
    type: BlogPostDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async updatePost(
    @Param('id') _id: string,
    @Body() _dto: UpdateBlogPostDto,
  ): Promise<BlogPostDto> {
    // TODO: implement update in BlogService
    throw new Error('Not implemented');
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete blog post (Admin only)',
    description: 'Delete blog post and associated content from R2. Admin only endpoint.',
  })
  @ApiParam({
    name: 'id',
    description: 'Blog post ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog post deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async deletePost(@Param('id') id: string): Promise<void> {
    await this.blogService.deletePost(id);
  }

  @Post(':id/publish')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Publish blog post (Admin only)',
    description: 'Publish a blog post. Admin only endpoint.',
  })
  @ApiParam({
    name: 'id',
    description: 'Blog post ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog post published successfully',
    type: BlogPostDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async publishPost(@Param('id') id: string): Promise<BlogPostDto> {
    return this.blogService.publishPost(id);
  }
}

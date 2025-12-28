import { UserRole } from '@generated/prisma';
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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateBlogPostCommand } from './commands/create-post/create-post.command';
import { DeleteBlogPostCommand } from './commands/delete-post/delete-post.command';
import { PublishBlogPostCommand } from './commands/publish-post/publish-post.command';
import { UpdateBlogPostCommand } from './commands/update-post/update-post.command';
import {
  BlogPostDto,
  BlogPostListResponseDto,
  BlogPostWithContentDto,
} from './dtos/blog-post.dto';
import { CreateBlogPostDto } from './dtos/create-post.dto';
import { GetBlogPostQueryDto } from './dtos/get-post-query.dto';
import { ListBlogPostsQueryDto } from './dtos/list-posts-query.dto';
import { SearchBlogPostsQueryDto } from './dtos/search-posts-query.dto';
import { UpdateBlogPostDto } from './dtos/update-post.dto';
import { GetBlogPostByIdQuery } from './queries/get-post-by-id/get-post-by-id.query';
import { GetBlogPostBySlugQuery } from './queries/get-post-by-slug/get-post-by-slug.query';
import { ListBlogPostsQuery } from './queries/list-posts/list-posts.query';
import { SearchBlogPostsQuery } from './queries/search-posts/search-posts.query';

@ApiTags('Blog')
@Controller('blog/posts')
export class BlogController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

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
  async listPosts(
    @Query() queryDto: ListBlogPostsQueryDto
  ): Promise<BlogPostListResponseDto> {
    return this.queryBus.execute(
      new ListBlogPostsQuery(
        queryDto.page ?? 1,
        queryDto.pageSize ?? 10,
        true // Only published posts for public endpoint
      )
    );
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
  async listAllPosts(
    @Query() queryDto: ListBlogPostsQueryDto
  ): Promise<BlogPostListResponseDto> {
    return this.queryBus.execute(
      new ListBlogPostsQuery(
        queryDto.page ?? 1,
        queryDto.pageSize ?? 20,
        undefined // No filter - get all posts
      )
    );
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
  async searchPosts(
    @Query() queryDto: SearchBlogPostsQueryDto
  ): Promise<BlogPostListResponseDto> {
    return this.queryBus.execute(
      new SearchBlogPostsQuery(
        queryDto.q,
        queryDto.page ?? 1,
        queryDto.pageSize ?? 10
      )
    );
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
  async getPostBySlug(
    @Param('slug') slug: string,
    @Query() queryDto: GetBlogPostQueryDto
  ): Promise<BlogPostDto | BlogPostWithContentDto> {
    return this.queryBus.execute(
      new GetBlogPostBySlugQuery(slug, queryDto.includeContent ?? false)
    );
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
    @Body() dto: CreateBlogPostDto
  ): Promise<BlogPostDto> {
    return this.commandBus.execute(
      new CreateBlogPostCommand(
        user.id,
        dto.slug,
        dto.title,
        dto.content,
        dto.excerpt || null,
        dto.coverImage || null,
        dto.isPublished || false,
        dto.metaTitle || null,
        dto.metaDescription || null
      )
    );
  }

  @Get('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get blog post by ID (Admin only)',
    description:
      'Get blog post details by ID with optional content. Admin only endpoint.',
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
  async getPostById(
    @Param('id') id: string,
    @Query() queryDto: GetBlogPostQueryDto
  ): Promise<BlogPostDto | BlogPostWithContentDto> {
    return this.queryBus.execute(
      new GetBlogPostByIdQuery(id, queryDto.includeContent ?? true)
    );
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
    @Param('id') id: string,
    @Body() dto: UpdateBlogPostDto
  ): Promise<BlogPostDto> {
    return this.commandBus.execute(
      new UpdateBlogPostCommand(
        id,
        dto.title,
        dto.content,
        dto.excerpt !== undefined ? dto.excerpt : undefined,
        dto.coverImage !== undefined ? dto.coverImage : undefined,
        dto.isPublished,
        dto.metaTitle !== undefined ? dto.metaTitle : undefined,
        dto.metaDescription !== undefined ? dto.metaDescription : undefined
      )
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete blog post (Admin only)',
    description:
      'Delete blog post and associated content from R2. Admin only endpoint.',
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
    return this.commandBus.execute(new DeleteBlogPostCommand(id));
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
    return this.commandBus.execute(new PublishBlogPostCommand(id));
  }
}

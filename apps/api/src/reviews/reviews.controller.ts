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

import { ProductSlug, UserRole } from '@generated/prisma';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateReviewCommand } from './commands/create-review/create-review.command';
import { DeleteReviewCommand } from './commands/delete-review/delete-review.command';
import { UpdateReviewCommand } from './commands/update-review/update-review.command';
import {
  CreateReviewDto,
  GetProductReviewsQueryDto,
  ReviewDto,
  ReviewListResponseDto,
  UpdateReviewDto,
} from './dtos/review.dto';
import { GetProductReviewsQuery } from './queries/get-product-reviews/get-product-reviews.query';

@ApiTags('Reviews')
@Controller('products')
export class ReviewsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post(':slug/reviews')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create review',
    description:
      'Create a review for a product. User must have purchased the product.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Product slug',
    enum: ['AO_THUN', 'PAD_CHUOT', 'DAY_DEO', 'MOC_KHOA'],
    example: 'AO_THUN',
  })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
    type: ReviewDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Conflict - Review already exists' })
  async createReview(
    @Param('slug', new ParseEnumPipe(ProductSlug))
    slug: ProductSlug,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateReviewDto
  ): Promise<ReviewDto> {
    return this.commandBus.execute(
      new CreateReviewCommand(user.id, slug, dto.rating, dto.comment)
    );
  }

  @Get(':slug/reviews')
  @Public()
  @ApiOperation({
    summary: 'Get product reviews',
    description: 'Get paginated reviews for a product',
  })
  @ApiParam({
    name: 'slug',
    description: 'Product slug',
    enum: ['AO_THUN', 'PAD_CHUOT', 'DAY_DEO', 'MOC_KHOA'],
    example: 'AO_THUN',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    example: 1,
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    example: 10,
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
    type: ReviewListResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductReviews(
    @Param('slug', new ParseEnumPipe(ProductSlug))
    slug: ProductSlug,
    @Query() queryDto: GetProductReviewsQueryDto
  ): Promise<ReviewListResponseDto> {
    return this.queryBus.execute(
      new GetProductReviewsQuery(slug, queryDto.page ?? 1, queryDto.limit ?? 10)
    );
  }

  @Patch('reviews/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update review',
    description: 'Update own review',
  })
  @ApiParam({
    name: 'id',
    description: 'Review ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully',
    type: ReviewDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async updateReview(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateReviewDto
  ): Promise<ReviewDto> {
    return this.commandBus.execute(
      new UpdateReviewCommand(id, user.id, dto.rating, dto.comment)
    );
  }

  @Delete('reviews/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete review',
    description: 'Delete review (Admin only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Review ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Review deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async deleteReview(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.commandBus.execute(new DeleteReviewCommand(id));
  }
}

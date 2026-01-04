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

import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ProductRepository } from '../../../products/infrastructure/product.repository';
import { ReviewDto, ReviewListResponseDto } from '../../dtos/review.dto';
import { ReviewRepository } from '../../infrastructure/review.repository';
import { ReviewWithRelations } from '../../types/review.types';
import { GetProductReviewsQuery } from './get-product-reviews.query';

@QueryHandler(GetProductReviewsQuery)
export class GetProductReviewsHandler implements IQueryHandler<GetProductReviewsQuery> {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async execute(query: GetProductReviewsQuery): Promise<ReviewListResponseDto> {
    const { productSlug, page, limit } = query;

    // Get product
    const product = await this.productRepository.findBySlug(productSlug);
    if (!product) {
      throw new NotFoundException(`Product with slug ${productSlug} not found`);
    }

    // Get reviews
    const { reviews, total } = await this.reviewRepository.findByProductId(
      product.id,
      page,
      limit
    );

    const totalPages = Math.ceil(total / limit);

    return {
      reviews: reviews.map((review) => this.mapToDto(review)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  private mapToDto(review: ReviewWithRelations): ReviewDto {
    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      userId: review.userId,
      userFullName: review.user.fullName || 'Anonymous',
      userAvatar: review.user.avatar,
      productId: review.productId,
      productSlug: review.product.slug,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }
}

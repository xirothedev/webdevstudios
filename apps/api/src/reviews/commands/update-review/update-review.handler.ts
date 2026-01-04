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

import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ProductRepository } from '../../../products/infrastructure/product.repository';
import { ReviewDto } from '../../dtos/review.dto';
import { ReviewRepository } from '../../infrastructure/review.repository';
import { ReviewWithRelations } from '../../types/review.types';
import { UpdateReviewCommand } from './update-review.command';

@CommandHandler(UpdateReviewCommand)
export class UpdateReviewHandler implements ICommandHandler<UpdateReviewCommand> {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async execute(command: UpdateReviewCommand): Promise<ReviewDto> {
    const { reviewId, userId, rating, comment } = command;

    // Get review
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundException(`Review with id ${reviewId} not found`);
    }

    // Verify ownership
    if (review.userId !== userId) {
      throw new ForbiddenException('Review does not belong to user');
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Update review
    const updateData: { rating?: number; comment?: string | null } = {};
    if (rating !== undefined) {
      updateData.rating = rating;
    }
    if (comment !== undefined) {
      updateData.comment = comment;
    }

    const updatedReview = await this.reviewRepository.update(
      reviewId,
      updateData
    );

    // Update product rating
    const { ratingValue, ratingCount } =
      await this.reviewRepository.calculateProductRating(review.productId);
    await this.productRepository.updateRating(
      review.productId,
      ratingValue,
      ratingCount
    );

    return this.mapToDto(updatedReview);
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

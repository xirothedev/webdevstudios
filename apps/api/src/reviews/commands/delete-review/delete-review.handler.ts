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
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ProductRepository } from '../../../products/infrastructure/product.repository';
import { ReviewRepository } from '../../infrastructure/review.repository';
import { DeleteReviewCommand } from './delete-review.command';

@CommandHandler(DeleteReviewCommand)
export class DeleteReviewHandler implements ICommandHandler<DeleteReviewCommand> {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async execute(command: DeleteReviewCommand): Promise<{ success: boolean }> {
    const { reviewId } = command;

    // Get review
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundException(`Review with id ${reviewId} not found`);
    }

    const productId = review.productId;

    // Delete review
    await this.reviewRepository.delete(reviewId);

    // Update product rating
    const { ratingValue, ratingCount } =
      await this.reviewRepository.calculateProductRating(productId);
    await this.productRepository.updateRating(
      productId,
      ratingValue,
      ratingCount
    );

    return { success: true };
  }
}

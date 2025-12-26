import { ForbiddenException, NotFoundException } from '@nestjs/common';
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
    const { reviewId, userId } = command;

    // Get review
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundException(`Review with id ${reviewId} not found`);
    }

    // Verify ownership
    if (review.userId !== userId) {
      throw new ForbiddenException('Review does not belong to user');
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

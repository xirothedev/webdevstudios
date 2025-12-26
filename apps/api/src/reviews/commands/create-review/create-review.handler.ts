import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OrderRepository } from '../../../orders/infrastructure/order.repository';
import { ProductRepository } from '../../../products/infrastructure/product.repository';
import { ReviewDto } from '../../dtos/review.dto';
import { ReviewRepository } from '../../infrastructure/review.repository';
import { ReviewWithRelations } from '../../types/review.types';
import { CreateReviewCommand } from './create-review.command';

@CommandHandler(CreateReviewCommand)
export class CreateReviewHandler implements ICommandHandler<CreateReviewCommand> {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly productRepository: ProductRepository,
    private readonly orderRepository: OrderRepository
  ) {}

  async execute(command: CreateReviewCommand): Promise<ReviewDto> {
    const { userId, productSlug, rating, comment } = command;

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Get product
    const product = await this.productRepository.findBySlug(productSlug);
    if (!product) {
      throw new NotFoundException(`Product with slug ${productSlug} not found`);
    }

    // Check if user has already reviewed this product
    const existingReview = await this.reviewRepository.findByUserAndProduct(
      userId,
      product.id
    );
    if (existingReview) {
      throw new ConflictException('User has already reviewed this product');
    }

    // Check if user has purchased this product
    const { orders } = await this.orderRepository.findByUserId(userId, 1, 100);
    const hasPurchased = orders.some((order) =>
      order.items.some(
        (item) =>
          item.productSlug === productSlug &&
          order.status !== 'CANCELLED' &&
          order.paymentStatus === 'PAID'
      )
    );

    if (!hasPurchased) {
      throw new BadRequestException(
        'You must purchase this product before reviewing'
      );
    }

    // Create review
    const review = await this.reviewRepository.create({
      userId,
      productId: product.id,
      rating,
      comment: comment || null,
    });

    // Update product rating
    const { ratingValue, ratingCount } =
      await this.reviewRepository.calculateProductRating(product.id);
    await this.productRepository.updateRating(
      product.id,
      ratingValue,
      ratingCount
    );

    return this.mapToDto(review);
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

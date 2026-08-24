import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductSlug } from '@prisma/client';

import { OrderRepo } from '@/orders/repo';
import { ProductRepo } from '@/products/repo';

import {
  CreateReviewDto,
  GetProductReviewsQueryDto,
  ReviewDto,
  ReviewListResponseDto,
  UpdateReviewDto,
} from '../dto';
import { ReviewWithRelations } from '../review.types';
import { ReviewRepo } from '../repo';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewRepository: ReviewRepo,
    private readonly productRepository: ProductRepo,
    private readonly orderRepository: OrderRepo,
  ) {}

  async createReview(userId: string, slug: ProductSlug, dto: CreateReviewDto): Promise<ReviewDto> {
    const { rating, comment } = dto;

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Get product
    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    // Check if user has already reviewed this product
    const existingReview = await this.reviewRepository.findByUserAndProduct(userId, product.id);
    if (existingReview) {
      throw new ConflictException('User has already reviewed this product');
    }

    // Check if user has purchased this product
    const { orders } = await this.orderRepository.findByUserId(userId, 1, 100);
    const hasPurchased = orders.some((order) =>
      order.items.some(
        (item) =>
          item.productSlug === slug &&
          order.status !== 'CANCELLED' &&
          order.paymentStatus === 'PAID',
      ),
    );

    if (!hasPurchased) {
      throw new BadRequestException('You must purchase this product before reviewing');
    }

    // Create review
    const review = await this.reviewRepository.create({
      userId,
      productId: product.id,
      rating,
      comment: comment || null,
    });

    // Update product rating
    const { ratingValue, ratingCount } = await this.reviewRepository.calculateProductRating(
      product.id,
    );
    await this.productRepository.updateRating(product.id, ratingValue, ratingCount);

    return this.toDto(review);
  }

  async getProductReviews(
    slug: ProductSlug,
    queryDto: GetProductReviewsQueryDto,
  ): Promise<ReviewListResponseDto> {
    // Get product
    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    const page = queryDto.page ?? 1;
    const limit = queryDto.limit ?? 10;

    // Get reviews
    const { reviews, total } = await this.reviewRepository.findByProductId(product.id, page, limit);

    const totalPages = Math.ceil(total / limit);

    return {
      reviews: reviews.map((review) => this.toDto(review)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async updateReview(reviewId: string, userId: string, dto: UpdateReviewDto): Promise<ReviewDto> {
    const { rating, comment } = dto;

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

    const updatedReview = await this.reviewRepository.update(reviewId, updateData);

    // Update product rating
    const { ratingValue, ratingCount } = await this.reviewRepository.calculateProductRating(
      review.productId,
    );
    await this.productRepository.updateRating(review.productId, ratingValue, ratingCount);

    return this.toDto(updatedReview);
  }

  async deleteReview(reviewId: string): Promise<{ success: boolean }> {
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
    await this.productRepository.updateRating(productId, ratingValue, ratingCount);

    return { success: true };
  }

  // ponytail: flatten + 'Anonymous' fallback can't come from a select; mirrors old mapToDto
  private toDto(review: ReviewWithRelations): ReviewDto {
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

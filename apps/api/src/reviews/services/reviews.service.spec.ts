import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { describe, expect, test } from 'bun:test';

import { OrderRepo } from '@/orders/repo';
import { ProductRepo } from '@/products/repo';

import { ReviewRepo } from '../repo';
import { ReviewsService } from './reviews.service';

const makeService = (fakes: {
  reviewRepo?: Record<string, unknown>;
  productRepo?: Record<string, unknown>;
  orderRepo?: Record<string, unknown>;
}) =>
  new ReviewsService(
    fakes.reviewRepo as unknown as ReviewRepo,
    fakes.productRepo as unknown as ProductRepo,
    fakes.orderRepo as unknown as OrderRepo,
  );

describe('ReviewsService', () => {
  test('createReview rejects unpurchased products', async () => {
    const service = makeService({
      productRepo: { findBySlug: async () => ({ id: 'p1' }) },
      reviewRepo: { findByUserAndProduct: async () => null },
      orderRepo: { findByUserId: async () => ({ orders: [] }) },
    });

    expect(
      service.createReview('u1', 'AO_THUN', { rating: 5, comment: undefined } as never),
    ).rejects.toThrow(BadRequestException);
  });

  test('updateReview forbids non-owners', async () => {
    const service = makeService({
      reviewRepo: { findById: async () => ({ userId: 'someone-else', productId: 'p1' }) },
    });

    expect(service.updateReview('r1', 'u1', {} as never)).rejects.toThrow(ForbiddenException);
  });

  test('deleteReview recalculates the product rating', async () => {
    let updatedRating: unknown[] = [];
    const service = makeService({
      reviewRepo: {
        findById: async () => ({ userId: 'u1', productId: 'p1' }),
        delete: async () => {},
        calculateProductRating: async () => ({ ratingValue: 4.5, ratingCount: 2 }),
      },
      productRepo: {
        updateRating: async (...args: unknown[]) => {
          updatedRating = args;
          return {};
        },
      },
    });

    await service.deleteReview('r1');
    expect(updatedRating).toEqual(['p1', 4.5, 2]);
  });
});

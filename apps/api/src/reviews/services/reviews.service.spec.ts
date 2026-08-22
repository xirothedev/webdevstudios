import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
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

describe('ReviewsService.createReview validation', () => {
  test('rating outside 1-5 is rejected before any repo call', async () => {
    const service = makeService({
      productRepo: { findBySlug: async () => ({ id: 'p1' }) },
    });

    await expect(service.createReview('u1', 'AO_THUN', { rating: 0 } as never)).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.createReview('u1', 'AO_THUN', { rating: 6 } as never)).rejects.toThrow(
      BadRequestException,
    );
  });

  test('unknown product slug throws NotFound', async () => {
    const service = makeService({
      productRepo: { findBySlug: async () => null },
    });

    await expect(
      service.createReview('u1', 'NOPE' as never, { rating: 5 } as never),
    ).rejects.toThrow(NotFoundException);
  });

  test('a second review of the same product throws Conflict', async () => {
    const service = makeService({
      productRepo: { findBySlug: async () => ({ id: 'p1' }) },
      reviewRepo: { findByUserAndProduct: async () => ({ id: 'r-existing' }) },
    });

    await expect(service.createReview('u1', 'AO_THUN', { rating: 5 } as never)).rejects.toThrow(
      ConflictException,
    );
  });
});

describe('ReviewsService.createReview happy path', () => {
  test('creates the review and pushes recalculated rating to the product', async () => {
    const created: Record<string, unknown> = {};
    let updatedRating: unknown[] = [];
    const reviewRow = {
      id: 'r-new',
      rating: 5,
      comment: null,
      userId: 'u1',
      user: { fullName: null, avatar: null },
      productId: 'p1',
      product: { slug: 'AO_THUN' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const service = makeService({
      productRepo: {
        findBySlug: async () => ({ id: 'p1' }),
        updateRating: async (...args: unknown[]) => {
          updatedRating = args;
          return {};
        },
      },
      reviewRepo: {
        findByUserAndProduct: async () => null,
        create: async (data: Record<string, unknown>) => {
          Object.assign(created, data);
          return reviewRow;
        },
        calculateProductRating: async () => ({ ratingValue: 5, ratingCount: 1 }),
      },
      orderRepo: {
        findByUserId: async () => ({
          orders: [
            { items: [{ productSlug: 'AO_THUN' }], paymentStatus: 'PAID' },
            { items: [{ productSlug: 'OTHER' }], paymentStatus: 'PENDING' },
          ],
        }),
      },
    });

    const dto = await service.createReview('u1', 'AO_THUN' as never, { rating: 5 } as never);

    expect(created).toMatchObject({ userId: 'u1', productId: 'p1', rating: 5, comment: null });
    expect(updatedRating).toEqual(['p1', 5, 1]);
    expect(dto.userFullName).toBe('Anonymous');
  });
});

describe('ReviewsService.getProductReviews', () => {
  test('unknown product throws NotFound', async () => {
    const service = makeService({
      productRepo: { findBySlug: async () => null },
    });

    await expect(
      service.getProductReviews('GHOST' as never, { page: 1, limit: 10 } as never),
    ).rejects.toThrow(NotFoundException);
  });

  test('returns paginated dtos with total pages', async () => {
    const reviewRow = {
      id: 'r1',
      rating: 4,
      comment: 'ok',
      userId: 'u2',
      user: { fullName: 'Alice', avatar: null },
      productId: 'p1',
      product: { slug: 'AO_THUN' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const service = makeService({
      productRepo: { findBySlug: async () => ({ id: 'p1' }) },
      reviewRepo: { findByProductId: async () => ({ reviews: [reviewRow], total: 21 }) },
    });

    const result = await service.getProductReviews(
      'AO_THUN' as never,
      {
        page: 2,
        limit: 10,
      } as never,
    );

    expect(result.total).toBe(21);
    expect(result.totalPages).toBe(3);
    expect(result.reviews[0]).toMatchObject({
      id: 'r1',
      userFullName: 'Alice',
      productSlug: 'AO_THUN',
    });
  });
});

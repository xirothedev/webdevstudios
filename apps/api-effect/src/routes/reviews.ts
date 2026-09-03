import { HttpApiBuilder } from 'effect/unstable/httpapi';

import { api } from '../api';
import { wrap, bodyOf } from '../lib/http';
import { Prisma, type Review, type ProductSlug, type User } from '../generated/prisma/client';
import { ApiError } from '../lib/errors';
import type { DatabaseClient } from '../lib/prisma';
import { bindBody } from '../lib/validate';
import { requireAuth } from '../lib/auth';
import { goTime, newId, paging } from '../lib/util';
import { VALID_SLUGS } from './products';

type ReviewRow = Review & { user: User; product?: { slug: string } };

function toDTO(r: ReviewRow, productSlug: ProductSlug | string) {
  return {
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    userId: r.userId,
    userFullName: r.user.fullName ?? 'Anonymous',
    userAvatar: r.user.avatar,
    productSlug,
    createdAt: goTime(r.createdAt),
    updatedAt: goTime(r.updatedAt),
  };
}

async function recomputeRating(db: DatabaseClient, productID: string): Promise<void> {
  const rows = await db.review.findMany({
    where: { productId: productID },
    select: { rating: true },
  });
  const count = rows.length;
  const value = count > 0 ? rows.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  await db.product.update({
    where: { id: productID },
    data: {
      ratingValue: new Prisma.Decimal(value),
      ratingCount: count,
    },
  });
}

async function ownedReview(
  db: DatabaseClient,
  reviewID: string,
  userID: string,
): Promise<ReviewRow> {
  const review = await db.review.findUnique({
    where: { id: reviewID },
    include: { user: true, product: true },
  });
  if (review === null) {
    throw new ApiError(404, `Review with id ${reviewID} not found`);
  }
  if (review.userId !== userID) {
    throw new ApiError(403, 'Review does not belong to user');
  }
  return review;
}

async function createReview(
  db: DatabaseClient,
  userID: string,
  slug: string,
  rating: number,
  comment: string | null,
) {
  if (!(VALID_SLUGS as readonly string[]).includes(slug)) {
    throw new ApiError(404, `Product with slug ${slug} not found`);
  }
  if (rating < 1 || rating > 5) {
    throw new ApiError(400, 'Rating must be between 1 and 5');
  }
  const p = await db.product.findFirst({
    where: { slug: slug as ProductSlug },
  });
  if (p === null) throw new ApiError(404, `Product with slug ${slug} not found`);
  const existing = await db.review.count({
    where: { userId: userID, productId: p.id },
  });
  if (existing > 0) {
    throw new ApiError(409, 'User has already reviewed this product');
  }
  // Has-purchase gate: an order item for this slug on a paid, non-cancelled order.
  const purchased = await db.orderItem.count({
    where: {
      productSlug: slug as ProductSlug,
      order: { userId: userID, status: { not: 'CANCELLED' }, paymentStatus: 'PAID' },
    },
  });
  if (purchased === 0) {
    throw new ApiError(400, 'You must purchase this product before reviewing');
  }
  const review = await db.review.create({
    data: {
      id: newId(),
      userId: userID,
      productId: p.id,
      rating,
      comment,
    },
    include: { user: true },
  });
  await recomputeRating(db, p.id);
  return toDTO(review, p.slug);
}

export const reviewsHandlers = HttpApiBuilder.group(api, 'reviews', (h) =>
  h
    .handle(
      'createReview',
      wrap(true, async (ctx) => {
        const auth = await requireAuth(ctx);
        const in1 = bindBody<{ rating?: number; comment?: string | null }>(await bodyOf(ctx), {
          Rating: { type: 'number', integer: true },
          Comment: { type: 'string' },
        });
        const dto = await createReview(
          ctx.db,
          auth.user.id,
          ctx.params.slug!,
          in1.rating ?? 0,
          in1.comment ?? null,
        );
        ctx.status = 201;
        return dto;
      }),
    )
    .handle(
      'listReviews',
      wrap(true, async (ctx) => {
        const slug = ctx.params.slug!;
        if (!(VALID_SLUGS as readonly string[]).includes(slug)) {
          throw new ApiError(404, `Product with slug ${slug} not found`);
        }
        const { page, limit } = paging(ctx.query.page, ctx.query.limit, 50);
        const p = await ctx.db.product.findFirst({ where: { slug: slug as ProductSlug } });
        if (p === null) throw new ApiError(404, `Product with slug ${slug} not found`);
        const where = { productId: p.id };
        const total = await ctx.db.review.count({ where });
        const rows = await ctx.db.review.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: { user: true },
        });
        return {
          reviews: rows.map((r) => toDTO(r, p.slug)),
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }),
    )
    .handle(
      'updateReview',
      wrap(true, async (ctx) => {
        const auth = await requireAuth(ctx);
        const in1 = bindBody<{ rating?: number; comment?: string | null }>(await bodyOf(ctx), {
          Rating: { type: 'number', integer: true },
          Comment: { type: 'string' },
        });
        const review = await ownedReview(ctx.db, ctx.params.id!, auth.user.id);
        if (in1.rating !== undefined && (in1.rating < 1 || in1.rating > 5)) {
          throw new ApiError(400, 'Rating must be between 1 and 5');
        }
        // ponytail: Go treats a null comment as absent (nil pointer → hasComment false).
        const data: Record<string, unknown> = {};
        if (in1.rating !== undefined) data.rating = in1.rating;
        if (typeof in1.comment === 'string') data.comment = in1.comment;
        if (Object.keys(data).length > 0) {
          await ctx.db.review.update({ where: { id: review.id }, data });
        }
        await recomputeRating(ctx.db, review.productId);
        const fresh = await ctx.db.review.findUnique({
          where: { id: review.id },
          include: { user: true, product: true },
        });
        if (fresh === null) throw new Error('review verify failed');
        return toDTO(fresh, fresh.product.slug);
      }),
    )
    .handle(
      'deleteReview',
      wrap(true, async (ctx) => {
        const auth = await requireAuth(ctx);
        const review = await ownedReview(ctx.db, ctx.params.id!, auth.user.id);
        const productID = review.productId;
        await ctx.db.review.delete({ where: { id: review.id } });
        await recomputeRating(ctx.db, productID);
        return { success: true };
      }),
    ),
);

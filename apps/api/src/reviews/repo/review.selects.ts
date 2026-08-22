import { Prisma } from '@prisma/client';

export type { ReviewWithRelations } from '../review.types';

export const REVIEW_SELECT = {
  id: true,
  rating: true,
  comment: true,
  userId: true,
  productId: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, fullName: true, avatar: true } },
  product: { select: { id: true, slug: true } },
} satisfies Prisma.ReviewSelect;

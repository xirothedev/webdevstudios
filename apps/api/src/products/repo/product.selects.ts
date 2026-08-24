import { Prisma } from '@prisma/client';

export type { ProductWithRelations } from '../product.types';

export const PRODUCT_SELECT = {
  id: true,
  slug: true,
  name: true,
  description: true,
  priceCurrent: true,
  priceOriginal: true,
  priceDiscount: true,
  stock: true,
  hasSizes: true,
  badge: true,
  ratingValue: true,
  ratingCount: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
  sizeStocks: {
    orderBy: { size: 'asc' as const },
  },
} satisfies Prisma.ProductSelect;

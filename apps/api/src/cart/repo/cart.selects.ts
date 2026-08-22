import { Prisma } from '@prisma/client';

export type { CartWithItems, CartItemWithProduct } from '../cart.types';

export const CART_WITH_ITEMS_INCLUDE = {
  items: {
    include: {
      product: {
        include: {
          sizeStocks: true,
        },
      },
    },
    orderBy: { id: 'desc' as const },
  },
} satisfies Prisma.CartInclude;

export const CART_ITEM_INCLUDE = {
  product: {
    include: {
      sizeStocks: true,
    },
  },
} satisfies Prisma.CartItemInclude;

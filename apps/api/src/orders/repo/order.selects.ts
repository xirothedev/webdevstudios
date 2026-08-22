import { Prisma } from '@prisma/client';
export const ORDER_SELECT = {
  id: true,
  code: true,
  userId: true,
  status: true,
  paymentStatus: true,
  totalAmount: true,
  shippingFee: true,
  discountValue: true,
  createdAt: true,
  updatedAt: true,
  shippingAddress: {
    select: {
      fullName: true,
      phone: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      district: true,
      ward: true,
      postalCode: true,
    },
  },
  items: {
    select: {
      id: true,
      productId: true,
      productSlug: true,
      productName: true,
      size: true,
      price: true,
      quantity: true,
    },
    orderBy: { id: 'asc' as const },
  },
} satisfies Prisma.OrderSelect;

export type OrderRow = Prisma.OrderGetPayload<{ select: typeof ORDER_SELECT }>;

import { describe, expect, test } from 'bun:test';
import { Prisma } from '../generated/prisma/client';

import { ApiError } from './errors';
import { createOrder, type CreateOrderInput } from './orders';
import { makePrismaFake } from '../test/prisma-fake';

const addr = {
  fullName: 'Nguyen Van A',
  phone: '0900000000',
  addressLine1: '1 Nguyen Hue',
  city: 'Ho Chi Minh City',
  district: 'D1',
  ward: 'W1',
  postalCode: '700000',
};

function directInput(overrides: Partial<CreateOrderInput> = {}): CreateOrderInput {
  return {
    orderType: 'DIRECT_PURCHASE',
    productId: 'p1',
    productSlug: 'AO_THUN',
    quantity: 1,
    shippingAddress: addr,
    ...overrides,
  };
}

function seedProduct(price: number, stock = 10) {
  return {
    id: 'p1',
    slug: 'AO_THUN',
    name: 'Áo thun',
    stock,
    priceCurrent: new Prisma.Decimal(price),
    hasSizes: false,
  };
}

describe('createOrder', () => {
  test('adds 30000 shipping fee when total < 500000 and reserves stock', async () => {
    const db = makePrismaFake({ product: [seedProduct(200000)] });

    const dto = await createOrder(db, 'u1', directInput({ quantity: 2 }));

    expect(dto.status).toBe('PENDING');
    expect(dto.paymentStatus).toBe('PENDING');
    expect(dto.shippingFee).toBe(30000);
    expect(dto.totalAmount).toBe(430000);
    expect(dto.items).toHaveLength(1);
    const p = await db.product.findUnique({ where: { id: 'p1' } });
    expect(p!.stock).toBe(8);
  });

  test('has no shipping fee when total >= 500000', async () => {
    const db = makePrismaFake({ product: [seedProduct(300000)] });

    const dto = await createOrder(db, 'u1', directInput({ quantity: 2 }));

    expect(dto.shippingFee).toBe(0);
    expect(dto.totalAmount).toBe(600000);
  });

  test('rejects when requested quantity exceeds stock', async () => {
    const db = makePrismaFake({ product: [seedProduct(100000, 1)] });

    const err = await createOrder(db, 'u1', directInput({ quantity: 2 })).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 409 });
  });

  test('rejects with 409 while the user has a PENDING order', async () => {
    const now = new Date('2026-08-31T00:00:00Z');
    const db = makePrismaFake({
      product: [seedProduct(100000)],
      order: [
        {
          id: 'o1',
          code: '#ORD-0001',
          userId: 'u1',
          status: 'PENDING',
          paymentStatus: 'PENDING',
          totalAmount: new Prisma.Decimal(130000),
          shippingFee: new Prisma.Decimal(30000),
          discountValue: new Prisma.Decimal(0),
          createdAt: now,
          updatedAt: now,
        },
      ],
    });

    const err = await createOrder(db, 'u1', directInput()).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 409 });
  });
});

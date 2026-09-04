import { describe, expect, test } from 'bun:test';
import { Prisma } from '../generated/prisma/client';

import { ApiError } from './errors';
import { createLinkForOrder } from './payments';
import { makePrismaFake } from '../test/prisma-fake';

function seedOrder(overrides: Record<string, unknown> = {}) {
  const now = new Date('2026-08-31T00:00:00Z');
  return {
    id: 'o1',
    code: '#ORD-0001',
    userId: 'u1',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    totalAmount: new Prisma.Decimal(230000),
    shippingFee: new Prisma.Decimal(30000),
    discountValue: new Prisma.Decimal(0),
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('createLinkForOrder', () => {
  test('rejects with 404 for an unknown order', async () => {
    const db = makePrismaFake({});

    const err = await createLinkForOrder(db, 'nope').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 404 });
  });

  test('rejects with 409 when the order is already paid', async () => {
    const db = makePrismaFake({
      order: [seedOrder({ paymentStatus: 'PAID' })],
    });

    const err = await createLinkForOrder(db, 'o1').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 409 });
  });

  test('returns the existing PENDING link without calling PayOS', async () => {
    const now = new Date('2026-08-31T00:00:00Z');
    const db = makePrismaFake({
      order: [seedOrder()],
      paymentTransaction: [
        {
          id: 'ptx1',
          orderId: 'o1',
          transactionCode: 'pay-link-1',
          amount: new Prisma.Decimal(230000),
          status: 'PENDING',
          paymentUrl: 'https://pay.example/1',
          createdAt: now,
          updatedAt: now,
        },
      ],
    });

    const link = await createLinkForOrder(db, 'o1');

    expect(link).toEqual({
      paymentUrl: 'https://pay.example/1',
      transactionCode: 'pay-link-1',
    });
  });

  test('rejects with 409 when a PENDING transaction has no payment URL', async () => {
    const now = new Date('2026-08-31T00:00:00Z');
    const db = makePrismaFake({
      order: [seedOrder()],
      paymentTransaction: [
        {
          id: 'ptx1',
          orderId: 'o1',
          transactionCode: 'pay-link-1',
          amount: new Prisma.Decimal(230000),
          status: 'PENDING',
          paymentUrl: null,
          createdAt: now,
          updatedAt: now,
        },
      ],
    });

    const err = await createLinkForOrder(db, 'o1').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 409 });
  });
});

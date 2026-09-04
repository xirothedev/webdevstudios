import { describe, expect, test } from 'bun:test';
import { Prisma } from '../generated/prisma/client';

import { ApiError } from '../lib/errors';
import { settleOrder } from '../lib/settle';
import { makePrismaFake } from '../test/prisma-fake';

function seedPaidFlow() {
  const now = new Date('2026-08-31T00:00:00Z');
  const db = makePrismaFake({
    order: [
      {
        id: 'o1',
        code: '#ORD-0001',
        userId: 'u1',
        status: 'PENDING',
        paymentStatus: 'PENDING',
        totalAmount: new Prisma.Decimal(329000),
        shippingFee: new Prisma.Decimal(30000),
        discountValue: new Prisma.Decimal(0),
        createdAt: now,
        updatedAt: now,
      },
    ],
    orderItem: [
      {
        id: 'oi1',
        orderId: 'o1',
        productId: 'p1',
        productSlug: 'AO_THUN',
        productName: 'Áo thun',
        size: null,
        price: new Prisma.Decimal(299000),
        quantity: 2,
      },
    ],
    paymentTransaction: [
      {
        id: 'ptx1',
        orderId: 'o1',
        transactionCode: 'pay-link-1',
        amount: new Prisma.Decimal(329000),
        status: 'PENDING',
        paymentUrl: null,
        createdAt: now,
        updatedAt: now,
      },
    ],
    product: [
      {
        id: 'p1',
        slug: 'AO_THUN',
        name: 'Áo thun',
        stock: 5,
        priceCurrent: new Prisma.Decimal(299000),
        hasSizes: false,
      },
    ],
  });
  return db;
}

const stateSnapshot = async (db: ReturnType<typeof makePrismaFake>) =>
  JSON.stringify([
    await db.order.findUnique({ where: { id: 'o1' } }),
    await db.paymentTransaction.findUnique({ where: { id: 'ptx1' } }),
    await db.product.findUnique({ where: { id: 'p1' } }),
    await db.productSizeStock.findFirst({ where: { productId: 'p1' } }),
  ]);

describe('settleOrder', () => {
  test('paid: claims the order, marks tx PAID, keeps stock', async () => {
    const db = seedPaidFlow();

    const claimed = await settleOrder(db, { orderId: 'o1', paid: true, txStatus: 'PAID' });

    expect(claimed).toBe(true);
    const order = await db.order.findUnique({ where: { id: 'o1' } });
    expect(order).toMatchObject({ status: 'CONFIRMED', paymentStatus: 'PAID' });
    const tx = await db.paymentTransaction.findUnique({ where: { id: 'ptx1' } });
    expect(tx).toMatchObject({ status: 'PAID' });
    const product = await db.product.findUnique({ where: { id: 'p1' } });
    expect(product?.stock).toBe(5);
  });

  test('second settle loses and writes nothing extra', async () => {
    const db = seedPaidFlow();
    await settleOrder(db, { orderId: 'o1', paid: true, txStatus: 'PAID' });
    const afterFirst = await stateSnapshot(db);

    const claimed = await settleOrder(db, { orderId: 'o1', paid: false, txStatus: 'FAILED' });

    expect(claimed).toBe(false);
    expect(await stateSnapshot(db)).toBe(afterFirst);
  });

  test('unpaid: claims, marks tx with given status, releases stock', async () => {
    const db = seedPaidFlow();

    const claimed = await settleOrder(db, { orderId: 'o1', paid: false, txStatus: 'CANCELLED' });

    expect(claimed).toBe(true);
    const order = await db.order.findUnique({ where: { id: 'o1' } });
    expect(order).toMatchObject({ status: 'CANCELLED', paymentStatus: 'FAILED' });
    const tx = await db.paymentTransaction.findUnique({ where: { id: 'ptx1' } });
    expect(tx).toMatchObject({ status: 'CANCELLED' });
    const product = await db.product.findUnique({ where: { id: 'p1' } });
    expect(product?.stock).toBe(7);
  });

  test('unpaid with sized item: releases size row and product total', async () => {
    const now = new Date('2026-08-31T00:00:00Z');
    const db = makePrismaFake({
      order: [
        {
          id: 'o1',
          code: '#ORD-0002',
          userId: 'u1',
          status: 'PENDING',
          paymentStatus: 'PENDING',
          totalAmount: new Prisma.Decimal(400000),
          shippingFee: new Prisma.Decimal(0),
          discountValue: new Prisma.Decimal(0),
          createdAt: now,
          updatedAt: now,
        },
      ],
      orderItem: [
        {
          id: 'oi1',
          orderId: 'o1',
          productId: 'p1',
          productSlug: 'AO_THUN',
          productName: 'Áo thun',
          size: 'M',
          price: new Prisma.Decimal(200000),
          quantity: 2,
        },
      ],
      paymentTransaction: [
        {
          id: 'ptx1',
          orderId: 'o1',
          transactionCode: 'pay-link-2',
          amount: new Prisma.Decimal(400000),
          status: 'PENDING',
          paymentUrl: null,
          createdAt: now,
          updatedAt: now,
        },
      ],
      product: [
        {
          id: 'p1',
          slug: 'AO_THUN',
          name: 'Áo thun',
          stock: 10,
          priceCurrent: new Prisma.Decimal(200000),
          hasSizes: true,
        },
      ],
      productSizeStock: [{ id: 'pss1', productId: 'p1', size: 'M', stock: 3 }],
    });

    const claimed = await settleOrder(db, { orderId: 'o1', paid: false, txStatus: 'FAILED' });

    expect(claimed).toBe(true);
    const size = await db.productSizeStock.findUnique({
      where: { productId_size: { productId: 'p1', size: 'M' } },
    });
    expect(size?.stock).toBe(5);
    const product = await db.product.findUnique({ where: { id: 'p1' } });
    expect(product?.stock).toBe(12);
  });

  test('txId: marks only the matched tx row, leaves older rows', async () => {
    const db = seedPaidFlow();
    (db.paymentTransaction as { createMany: (a: unknown) => Promise<unknown> }).createMany({
      data: [
        {
          id: 'ptx0',
          orderId: 'o1',
          transactionCode: 'pay-link-0',
          amount: new Prisma.Decimal(329000),
          status: 'CANCELLED',
          paymentUrl: null,
        },
      ],
    });

    const claimed = await settleOrder(db, {
      orderId: 'o1',
      paid: true,
      txStatus: 'PAID',
      txId: 'ptx1',
    });

    expect(claimed).toBe(true);
    const target = await db.paymentTransaction.findUnique({ where: { id: 'ptx1' } });
    expect(target).toMatchObject({ status: 'PAID' });
    const older = await db.paymentTransaction.findUnique({ where: { id: 'ptx0' } });
    expect(older).toMatchObject({ status: 'CANCELLED' });
  });

  test('lost claim: marks tx with lostTxStatus, leaves order and stock untouched', async () => {
    const db = seedPaidFlow();
    await settleOrder(db, { orderId: 'o1', paid: true, txStatus: 'PAID' });
    const orderAfter = JSON.stringify(await db.order.findUnique({ where: { id: 'o1' } }));
    const stockAfter = JSON.stringify(await db.product.findUnique({ where: { id: 'p1' } }));

    const claimed = await settleOrder(db, {
      orderId: 'o1',
      paid: false,
      txStatus: 'CANCELLED',
      txId: 'ptx1',
      lostTxStatus: 'CANCELLED',
    });

    expect(claimed).toBe(false);
    expect(JSON.stringify(await db.order.findUnique({ where: { id: 'o1' } }))).toBe(orderAfter);
    expect(JSON.stringify(await db.product.findUnique({ where: { id: 'p1' } }))).toBe(stockAfter);
    const tx = await db.paymentTransaction.findUnique({ where: { id: 'ptx1' } });
    expect(tx).toMatchObject({ status: 'CANCELLED' });
  });

  test('unknown order: rejects with 404', async () => {
    const db = seedPaidFlow();

    const err = await settleOrder(db, { orderId: 'nope', paid: true, txStatus: 'PAID' }).catch(
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(404);
  });
});

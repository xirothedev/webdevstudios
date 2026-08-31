import { Prisma, type ProductSize } from '../generated/prisma/client';

import { ApiError } from './errors';
import type { DatabaseClient } from './prisma';

// PENDING orders auto-cancel after this; sweep runs every 5 min (index.ts).
export const ORDER_EXPIRY_MS = 15 * 60 * 1000;

export type StockItem = {
  productId: string;
  size: ProductSize | null;
  quantity: number;
};

export type TxStatus = 'PAID' | 'FAILED' | 'CANCELLED';

// Conditional decrement — WHERE stock >= qty makes oversell impossible.
export async function reserveStock(
  tx: Prisma.TransactionClient,
  items: StockItem[],
): Promise<void> {
  for (const it of items) {
    if (it.size === null) {
      const res = await tx.product.updateMany({
        where: { id: it.productId, stock: { gte: it.quantity } },
        data: { stock: { decrement: it.quantity }, updatedAt: new Date() },
      });
      if (res.count === 0) {
        throw new ApiError(409, `Insufficient stock for product ${it.productId}`);
      }
      continue;
    }
    const res = await tx.productSizeStock.updateMany({
      where: { productId: it.productId, size: it.size },
      data: { stock: { decrement: it.quantity }, updatedAt: new Date() },
    });
    if (res.count === 0) {
      throw new ApiError(409, `Insufficient stock for size ${it.size} of product ${it.productId}`);
    }
    await tx.product.update({
      where: { id: it.productId },
      data: { stock: { decrement: it.quantity }, updatedAt: new Date() },
    });
  }
}

export async function releaseStock(
  tx: Prisma.TransactionClient,
  items: StockItem[],
): Promise<void> {
  for (const it of items) {
    if (it.size === null) {
      await tx.product.update({
        where: { id: it.productId },
        data: { stock: { increment: it.quantity }, updatedAt: new Date() },
      });
      continue;
    }
    await tx.productSizeStock.update({
      where: { productId_size: { productId: it.productId, size: it.size } },
      data: { stock: { increment: it.quantity }, updatedAt: new Date() },
    });
    await tx.product.update({
      where: { id: it.productId },
      data: { stock: { increment: it.quantity }, updatedAt: new Date() },
    });
  }
}

// Settle-once: claims PENDING -> CONFIRMED/PAID or CANCELLED/FAILED atomically,
// marks the payment transaction, releases reserved stock when not paid.
// Returns false when another settle already claimed the order; when the claim
// is lost and txId+lostTxStatus are given, the tx row is still marked
// lostTxStatus so it never stays PENDING (webhook bookkeeping).
export async function settleOrder(
  db: DatabaseClient,
  opts: {
    orderId: string;
    paid: boolean;
    txStatus?: TxStatus;
    txId?: string;
    lostTxStatus?: TxStatus;
  },
): Promise<boolean> {
  const order = await db.order.findUnique({
    where: { id: opts.orderId },
    include: { items: true },
  });
  if (order === null) {
    throw new ApiError(404, `Order with id ${opts.orderId} not found`);
  }
  const items: StockItem[] = order.items
    .filter((it) => it.productId !== null)
    .map((it) => ({
      productId: it.productId!,
      size: it.size,
      quantity: it.quantity,
    }));
  return db.$transaction(async (tx) => {
    const claimed = await tx.order.updateMany({
      where: { id: opts.orderId, status: 'PENDING' },
      data: opts.paid
        ? { status: 'CONFIRMED', paymentStatus: 'PAID', updatedAt: new Date() }
        : { status: 'CANCELLED', paymentStatus: 'FAILED', updatedAt: new Date() },
    });
    if (claimed.count === 0) {
      if (opts.txId !== undefined && opts.lostTxStatus !== undefined) {
        await tx.paymentTransaction.updateMany({
          where: { id: opts.txId },
          data: { status: opts.lostTxStatus, updatedAt: new Date() },
        });
      }
      return false;
    }
    if (opts.txStatus !== undefined) {
      await tx.paymentTransaction.updateMany({
        where: opts.txId !== undefined ? { id: opts.txId } : { orderId: opts.orderId },
        data: { status: opts.txStatus, updatedAt: new Date() },
      });
    }
    if (!opts.paid) await releaseStock(tx, items);
    return true;
  });
}

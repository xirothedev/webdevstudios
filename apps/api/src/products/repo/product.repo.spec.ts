import { ConflictException } from '@nestjs/common';
import { describe, expect, test } from 'bun:test';

import type { PrismaService } from '@/prisma';

import { availableStock, ProductRepo } from './product.repo';

// ponytail: hand-rolled fakes per repo-seam rule; swap for a builder if this file grows past ~150 lines
describe('ProductRepo.reserve', () => {
  test('a losing concurrent reserve fails via the conditional-update count check', async () => {
    const captured: { table: string; where: Record<string, unknown> }[] = [];
    const prisma = {
      productSizeStock: {
        updateMany: async ({ where }: { where: Record<string, unknown> }) => {
          captured.push({ table: 'productSizeStock', where });
          return { count: 0 };
        },
      },
      product: {
        updateMany: async ({ where }: { where: Record<string, unknown> }) => {
          captured.push({ table: 'product', where });
          return { count: 0 };
        },
      },
    } as unknown as PrismaService;
    const repo = new ProductRepo(prisma);

    await expect(
      repo.reserve(undefined, [{ productId: 'p1', size: 'M', quantity: 2 }]),
    ).rejects.toThrow(ConflictException);
    expect(captured[0]).toEqual({
      table: 'productSizeStock',
      where: { productId: 'p1', size: 'M', stock: { gte: 2 } },
    });

    await expect(
      repo.reserve(undefined, [{ productId: 'p2', size: null, quantity: 3 }]),
    ).rejects.toThrow(ConflictException);
    expect(captured[1].table).toBe('product');
    expect(captured[1].where).toMatchObject({ id: 'p2', stock: { gte: 3 } });
  });

  test('a winning reserve decrements through the same conditional update', async () => {
    const updates: unknown[] = [];
    const prisma = {
      productSizeStock: {
        updateMany: async (args: unknown) => {
          updates.push(args);
          return { count: 1 };
        },
      },
      product: {
        updateMany: async (args: unknown) => {
          updates.push(args);
          return { count: 1 };
        },
      },
    } as unknown as PrismaService;
    const repo = new ProductRepo(prisma);

    await repo.reserve(undefined, [
      { productId: 'p1', size: 'M', quantity: 1 },
      { productId: 'p2', size: null, quantity: 4 },
    ]);

    expect(updates).toHaveLength(2);
  });
});

describe('availableStock', () => {
  const product = {
    hasSizes: true,
    stock: 10,
    sizeStocks: [
      { id: 'ss-1', productId: 'p1', size: 'M' as const, stock: 3 },
      { id: 'ss-2', productId: 'p1', size: 'L' as const, stock: 0 },
    ],
  };

  test('reads per-size stock when the product has sizes', () => {
    expect(availableStock(product, 'M')).toBe(3);
  });

  test('returns null for an unknown size', () => {
    expect(availableStock(product, 'S')).toBe(null);
  });

  test('falls back to total stock without sizes', () => {
    expect(availableStock({ ...product, hasSizes: false }, 'M')).toBe(10);
    expect(availableStock(product, null)).toBe(10);
  });
});

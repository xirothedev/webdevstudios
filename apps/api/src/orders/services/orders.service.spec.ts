import { BadRequestException, ConflictException } from '@nestjs/common';
import { describe, expect, test } from 'bun:test';

import type { CartRepo } from '@/cart/repo';
import type { PrismaService } from '@/prisma';
import type { ProductRepo } from '@/products/repo';

import type { CreateOrderDto } from '../dto';
import type { OrderRepo } from '../repo';
import { OrderService } from './orders.service';

// ponytail: hand-rolled fakes per repo-seam rule; swap for a builder if this file grows past ~150 lines
const makePrisma = () => {
  const tx = {
    shippingAddress: { create: async () => ({ id: 'addr-1' }) },
    order: {
      create: async ({ data }: { data: Record<string, unknown> }) => ({
        id: 'order-1',
        code: data.code,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        totalAmount: data.totalAmount,
        shippingFee: data.shippingFee,
        discountValue: data.discountValue,
        createdAt: new Date(),
        updatedAt: new Date(),
        shippingAddress: {},
        items: [],
      }),
    },
    productSizeStock: { updateMany: async () => ({ count: 1 }) },
    product: { update: async () => ({}) },
  };
  return {
    $transaction: async (fn: (t: unknown) => Promise<unknown>) => fn(tx),
  } as unknown as PrismaService;
};

const baseProduct = {
  id: 'p1',
  slug: 'AO_THUN',
  name: 'Áo thun',
  hasSizes: false,
  stock: 5,
  priceCurrent: 299000,
};

const makeRepos = (
  overrides: {
    orderRepo?: Record<string, unknown>;
    cartRepo?: Record<string, unknown>;
    productRepo?: Record<string, unknown>;
  } = {},
) => {
  const orderRepo = {
    findPendingOrdersByUserId: async () => [],
    generateOrderCode: async () => '#ORD-0001',
    create: async (data: Record<string, unknown>) => data,
    ...overrides.orderRepo,
  } as unknown as OrderRepo;
  const cartRepo = {
    findOrCreateCart: async () => ({ id: 'cart-1', items: [] }),
    clearCart: async () => {},
    ...overrides.cartRepo,
  } as unknown as CartRepo;
  const productRepo = {
    findById: async () => baseProduct,
    getStockBySize: async () => null,
    ...overrides.productRepo,
  } as unknown as ProductRepo;
  return { orderRepo, cartRepo, productRepo };
};

const directDto = (extra: Record<string, unknown> = {}) =>
  ({ orderType: 'DIRECT_PURCHASE', shippingAddress: {}, ...extra }) as never as CreateOrderDto;

describe('OrderService.createOrder', () => {
  test('rejects a second order while one is pending', async () => {
    const { orderRepo, cartRepo, productRepo } = makeRepos({
      orderRepo: { findPendingOrdersByUserId: async () => [{ id: 'pending-1' }] },
    });
    const service = new OrderService(orderRepo, cartRepo, productRepo, makePrisma());

    expect(service.createOrder('u1', directDto({ productId: 'p1' }) as never)).rejects.toThrow(
      ConflictException,
    );
  });

  test('DIRECT_PURCHASE requires productId, productSlug and quantity', async () => {
    const { orderRepo, cartRepo, productRepo } = makeRepos();
    const service = new OrderService(orderRepo, cartRepo, productRepo, makePrisma());

    expect(
      service.createOrder('u1', { orderType: 'DIRECT_PURCHASE', shippingAddress: {} } as never),
    ).rejects.toThrow(BadRequestException);
  });

  test('DIRECT_PURCHASE charges 30000 shipping below the 500000 threshold', async () => {
    let created: Record<string, unknown> = {};
    const { orderRepo, cartRepo, productRepo } = makeRepos({
      orderRepo: {
        create: async (data: Record<string, unknown>) => {
          created = data;
          return data;
        },
      },
    });
    const service = new OrderService(orderRepo, cartRepo, productRepo, makePrisma());

    const dto = await service.createOrder(
      'u1',
      directDto({ productId: 'p1', productSlug: 'AO_THUN', quantity: 1 }),
    );
    expect(dto.shippingFee).toBe(30000);
    expect(created.totalAmount).toBe(329000);
  });

  test('DIRECT_PURCHASE shipping is free at or above 500000', async () => {
    const { orderRepo, cartRepo, productRepo } = makeRepos();
    const service = new OrderService(orderRepo, cartRepo, productRepo, makePrisma());

    const dto = await service.createOrder(
      'u1',
      directDto({ productId: 'p1', productSlug: 'AO_THUN', quantity: 2 }),
    );
    // ponytail: priceCurrent stays 299000 in the fake, so 2 units = 598000 >= 500000
    expect(dto.shippingFee).toBe(0);
  });

  test('FROM_CART rejects an empty cart', async () => {
    const { orderRepo, cartRepo, productRepo } = makeRepos();
    const service = new OrderService(orderRepo, cartRepo, productRepo, makePrisma());

    expect(
      service.createOrder('u1', { orderType: 'FROM_CART', shippingAddress: {} } as never),
    ).rejects.toThrow(BadRequestException);
  });
});

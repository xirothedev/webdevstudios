import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
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
    reserve: async () => {},
    release: async () => {},
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

const baseOrder = {
  id: 'order-1',
  code: '#ORD-0001',
  userId: 'u1',
  status: 'PENDING',
  paymentStatus: 'PENDING',
  totalAmount: 329000,
  shippingFee: 30000,
  discountValue: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  shippingAddress: {
    fullName: 'Test User',
    phone: '123',
    addressLine1: 'Line 1',
    addressLine2: null,
    city: 'Hanoi',
    district: 'Cau Giay',
    ward: 'Dich Vong',
    postalCode: null,
  },
  items: [
    {
      id: 'oi-1',
      productId: 'p1',
      productSlug: 'AO_THUN',
      productName: 'Áo thun',
      size: null,
      price: 299000,
      quantity: 2,
    },
  ],
};

describe('OrderService.getOrderById', () => {
  test('non-owner non-admin request is forbidden', async () => {
    const { orderRepo, cartRepo, productRepo } = makeRepos({
      orderRepo: { findById: async () => ({ ...baseOrder }) },
    });
    const service = new OrderService(orderRepo, cartRepo, productRepo, makePrisma());

    await expect(service.getOrderById('order-1', 'u2', 'USER')).rejects.toThrow(ForbiddenException);
  });
});

describe('OrderService.updateOrderStatus', () => {
  test('only admin may update the status', async () => {
    const { orderRepo, cartRepo, productRepo } = makeRepos();
    const service = new OrderService(orderRepo, cartRepo, productRepo, makePrisma());

    await expect(service.updateOrderStatus('order-1', 'CONFIRMED', 'USER')).rejects.toThrow(
      ForbiddenException,
    );
  });

  test('confirming a pending-payment order marks it PAID', async () => {
    let paymentStatusUpdate: string | undefined;
    // ponytail: queue simulates row state before/after the payment-status write
    const rows = [baseOrder, { ...baseOrder, status: 'CONFIRMED', paymentStatus: 'PAID' }];
    const { orderRepo, cartRepo, productRepo } = makeRepos({
      orderRepo: {
        findById: async () => rows.shift(),
        updateStatus: async () => ({ ...baseOrder, status: 'CONFIRMED' }),
        updatePaymentStatus: async (_id: string, status: string) => {
          paymentStatusUpdate = status;
          return {};
        },
      },
    });
    const service = new OrderService(orderRepo, cartRepo, productRepo, makePrisma());

    const dto = await service.updateOrderStatus('order-1', 'CONFIRMED', 'ADMIN');

    expect(paymentStatusUpdate).toBe('PAID');
    expect(dto.status).toBe('CONFIRMED');
    expect(dto.paymentStatus).toBe('PAID');
  });
});

describe('OrderService.cancelOrder', () => {
  test('non-owner cancellation is forbidden', async () => {
    const { orderRepo, cartRepo, productRepo } = makeRepos({
      orderRepo: { findById: async () => ({ ...baseOrder }) },
    });
    const service = new OrderService(orderRepo, cartRepo, productRepo, makePrisma());

    await expect(service.cancelOrder('order-1', 'u2')).rejects.toThrow(ForbiddenException);
  });

  test('only PENDING orders can be cancelled', async () => {
    const { orderRepo, cartRepo, productRepo } = makeRepos({
      orderRepo: { findById: async () => ({ ...baseOrder, status: 'SHIPPING' }) },
    });
    const service = new OrderService(orderRepo, cartRepo, productRepo, makePrisma());

    await expect(service.cancelOrder('order-1', 'u1')).rejects.toThrow(BadRequestException);
  });

  test('losing the concurrent claim is rejected without stock changes', async () => {
    let releaseCalled = false;
    const { orderRepo, cartRepo, productRepo } = makeRepos({
      orderRepo: {
        findById: async () => ({ ...baseOrder }),
        cancelPending: async () => 0,
      },
      productRepo: {
        release: async () => {
          releaseCalled = true;
        },
      },
    });
    const service = new OrderService(orderRepo, cartRepo, productRepo, makePrisma());

    await expect(service.cancelOrder('order-1', 'u1')).rejects.toThrow(BadRequestException);
    expect(releaseCalled).toBe(false);
  });

  test('cancelling releases stock for sized and unsized items in one call', async () => {
    const released: unknown[][] = [];
    const { orderRepo, cartRepo, productRepo } = makeRepos({
      orderRepo: {
        findById: async () => ({
          ...baseOrder,
          items: [baseOrder.items[0], { ...baseOrder.items[0], id: 'oi-2', size: 'M' }],
        }),
        cancelPending: async () => 1,
      },
      productRepo: {
        release: async (_tx: unknown, items: unknown[]) => {
          released.push(items);
        },
      },
    });
    const service = new OrderService(orderRepo, cartRepo, productRepo, makePrisma());

    const dto = await service.cancelOrder('order-1', 'u1');

    expect(dto.status).toBe('PENDING');
    expect(released).toEqual([
      [
        { productId: 'p1', size: null, quantity: 2 },
        { productId: 'p1', size: 'M', quantity: 2 },
      ],
    ]);
  });
});

describe('OrderService.expireOrder', () => {
  test('already-processed orders return silently without a transaction', async () => {
    const prisma = {
      $transaction: async () => {
        throw new Error('transaction must not run');
      },
    } as unknown as PrismaService;
    const { orderRepo, cartRepo, productRepo } = makeRepos({
      orderRepo: { findById: async () => ({ ...baseOrder, status: 'CANCELLED' }) },
    });
    const service = new OrderService(orderRepo, cartRepo, productRepo, prisma);

    await service.expireOrder('order-1');
  });

  test('paid orders are never expired', async () => {
    const prisma = {
      $transaction: async () => {
        throw new Error('transaction must not run');
      },
    } as unknown as PrismaService;
    const { orderRepo, cartRepo, productRepo } = makeRepos({
      orderRepo: { findById: async () => ({ ...baseOrder, paymentStatus: 'PAID' }) },
    });
    const service = new OrderService(orderRepo, cartRepo, productRepo, prisma);

    await service.expireOrder('order-1');
  });

  test('losing the concurrent expiry claim skips stock restore', async () => {
    const tx = {
      order: { updateMany: async () => ({ count: 0 }) },
      productSizeStock: {
        updateMany: async () => {
          throw new Error('stock must not be restored');
        },
      },
      product: {
        update: async () => {
          throw new Error('stock must not be restored');
        },
      },
    };
    const prisma = {
      $transaction: async (fn: (t: unknown) => Promise<unknown>) => fn(tx),
    } as unknown as PrismaService;
    const { orderRepo, cartRepo, productRepo } = makeRepos({
      orderRepo: { findById: async () => ({ ...baseOrder }) },
    });
    const service = new OrderService(orderRepo, cartRepo, productRepo, prisma);

    await service.expireOrder('order-1');
  });
});

describe('OrderService reads & plain status updates', () => {
  test('owner can read their order', async () => {
    const { orderRepo, cartRepo, productRepo } = makeRepos({
      orderRepo: { findById: async () => ({ ...baseOrder }) },
    });
    const service = new OrderService(orderRepo, cartRepo, productRepo, makePrisma());

    const dto = await service.getOrderById('order-1', 'u1', 'USER');

    expect(dto.id).toBe('order-1');
    expect(dto.items[0]).toMatchObject({ productSlug: 'AO_THUN', subtotal: 598000 });
  });

  test('non-CONFIRMED status updates leave paymentStatus untouched', async () => {
    let paymentTouched = false;
    const { orderRepo, cartRepo, productRepo } = makeRepos({
      orderRepo: {
        findById: async () => ({ ...baseOrder }),
        updateStatus: async (_id: string, status: string) => ({ ...baseOrder, status }),
        updatePaymentStatus: async () => {
          paymentTouched = true;
          return {};
        },
      },
    });
    const service = new OrderService(orderRepo, cartRepo, productRepo, makePrisma());

    const dto = await service.updateOrderStatus('order-1', 'SHIPPING', 'ADMIN');

    expect(dto.status).toBe('SHIPPING');
    expect(dto.paymentStatus).toBe('PENDING');
    expect(paymentTouched).toBe(false);
  });

  test('listOrders maps rows and passes the total through', async () => {
    const { orderRepo, cartRepo, productRepo } = makeRepos({
      orderRepo: {
        findByUserId: async () => ({ orders: [{ ...baseOrder }], total: 7 }),
      },
    });
    const service = new OrderService(orderRepo, cartRepo, productRepo, makePrisma());

    const result = await service.listOrders('u1', 1, 10);

    expect(result.total).toBe(7);
    expect(result.orders[0].code).toBe('#ORD-0001');
  });

  test('listAllOrders combines findAll with countAll', async () => {
    const { orderRepo, cartRepo, productRepo } = makeRepos({
      orderRepo: {
        findAll: async (_page: number, _limit: number, status?: string) => {
          allStatus = status;
          return [{ ...baseOrder }];
        },
        countAll: async (status?: string) => {
          countStatus = status;
          return 3;
        },
      },
    });
    let allStatus: string | undefined;
    let countStatus: string | undefined;
    const service = new OrderService(orderRepo, cartRepo, productRepo, makePrisma());

    const result = await service.listAllOrders(2, 20, 'PENDING');

    expect(result.total).toBe(3);
    expect(result.orders).toHaveLength(1);
    expect(allStatus).toBe('PENDING');
    expect(countStatus).toBe('PENDING');
  });
});

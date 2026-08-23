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
    paymentTransaction: {
      findUnique: async () => null,
      update: async () => ({}),
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

  test('confirming never touches the payment status', async () => {
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

    const dto = await service.updateOrderStatus('order-1', 'CONFIRMED', 'ADMIN');

    expect(dto.status).toBe('CONFIRMED');
    expect(dto.paymentStatus).toBe('PENDING');
    expect(paymentTouched).toBe(false);
  });
});
describe('OrderService.settle', () => {
  const makeSettleDeps = (
    overrides: {
      claimSettled?: (id: string, paid: boolean) => Promise<number>;
      paymentTx?: unknown;
    } = {},
  ) => {
    const events: string[] = [];
    let txStatus: string | undefined;
    // ponytail: fake row state flips when a claim wins, mirroring updateMany
    let settledState: { paid: boolean } | null = null;
    const claim =
      overrides.claimSettled ??
      (async (_id: string, paid: boolean) => {
        settledState = { paid };
        return 1;
      });
    const tx = {
      order: { updateMany: async () => ({ count: 0 }) },
      paymentTransaction: {
        findUnique: async () => (overrides.paymentTx === undefined ? null : { id: 'ptx-1' }),
        update: async ({ data }: { data: { status: string } }) => {
          txStatus = data.status;
          return {};
        },
      },
      productSizeStock: { updateMany: async () => events.push('size-release') },
      product: { update: async () => events.push('stock-release') },
    };
    const prisma = {
      $transaction: async (fn: (t: unknown) => Promise<unknown>) => fn(tx),
    } as unknown as PrismaService;
    const { orderRepo, cartRepo, productRepo } = makeRepos({
      orderRepo: {
        findById: async () => {
          if (!settledState) return { ...baseOrder };
          return {
            ...baseOrder,
            status: settledState.paid ? 'CONFIRMED' : 'CANCELLED',
            paymentStatus: settledState.paid ? 'PAID' : 'FAILED',
          };
        },
        claimSettled: async (id: string, paid: boolean) => {
          const count = await claim(id, paid);
          if (count > 0) settledState = { paid };
          return count;
        },
      },
      productRepo: {
        release: async () => events.push('release'),
      },
    });
    const service = new OrderService(orderRepo, cartRepo, productRepo, prisma);
    return { events, getTxStatus: () => txStatus, service };
  };

  test('winning the claim settles PAID without restocking', async () => {
    let claimedPaid: boolean | undefined;
    const { events, getTxStatus, service } = makeSettleDeps({
      claimSettled: async (_id, paid) => {
        claimedPaid = paid;
        return 1;
      },
      paymentTx: { id: 'ptx-1' },
    });

    const dto = await service.settle('order-1', { paid: true });

    expect(claimedPaid).toBe(true);
    expect(getTxStatus()).toBe('PAID');
    expect(dto?.status).toBe('CONFIRMED');
    expect(dto?.paymentStatus).toBe('PAID');
    expect(events).toEqual([]);
  });

  test('settling twice claims once and rests stock exactly once', async () => {
    let claims = 0;
    const { events, service } = makeSettleDeps({
      claimSettled: async () => (++claims === 1 ? 1 : 0),
    });

    const first = await service.settle('order-1', { paid: false });
    const second = await service.settle('order-1', { paid: false });

    expect(first?.status).toBe('CANCELLED');
    expect(first?.paymentStatus).toBe('FAILED');
    expect(second).toBeNull();
    expect(events).toEqual(['release']);
  });

  test('unpaid settle fails the transaction row and releases inside the transaction', async () => {
    const { events, getTxStatus, service } = makeSettleDeps({
      paymentTx: { id: 'ptx-1' },
    });

    await service.settle('order-1', { paid: false });

    expect(getTxStatus()).toBe('FAILED');
    expect(events).toEqual(['release']);
  });

  test('losing the claim no-ops without stock or transaction writes', async () => {
    const { events, getTxStatus, service } = makeSettleDeps({
      claimSettled: async () => 0,
      paymentTx: { id: 'ptx-1' },
    });

    const result = await service.settle('order-1', { paid: true });

    expect(result).toBeNull();
    expect(getTxStatus()).toBeUndefined();
    expect(events).toEqual([]);
  });
});

describe('OrderService.markPaid', () => {
  test('marks a PENDING order paid via the settle claim', async () => {
    let released = false;
    const { orderRepo, cartRepo, productRepo } = makeRepos({
      orderRepo: {
        findById: async () => ({
          ...baseOrder,
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
        }),
        claimSettled: async (_id: string, paid: boolean) => (paid ? 1 : 0),
      },
      productRepo: {
        release: async () => {
          released = true;
        },
      },
    });
    const service = new OrderService(orderRepo, cartRepo, productRepo, makePrisma());

    const dto = await service.markPaid('order-1');

    expect(dto.status).toBe('CONFIRMED');
    expect(dto.paymentStatus).toBe('PAID');
    expect(released).toBe(false);
  });

  test('non-PENDING orders are rejected PENDING-only', async () => {
    let released = false;
    const { orderRepo, cartRepo, productRepo } = makeRepos({
      orderRepo: {
        findById: async () => ({ ...baseOrder }),
        claimSettled: async () => 0,
      },
      productRepo: {
        release: async () => {
          released = true;
        },
      },
    });
    const service = new OrderService(orderRepo, cartRepo, productRepo, makePrisma());

    await expect(service.markPaid('order-1')).rejects.toThrow(BadRequestException);
    expect(released).toBe(false);
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

  test('losing the concurrent expiry claim skips stock restore and txn update', async () => {
    const events: string[] = [];
    const tx = {
      order: { updateMany: async () => ({ count: 0 }) },
      paymentTransaction: {
        findUnique: async () => ({ id: 'ptx-1' }),
        update: async () => events.push('ptx'),
      },
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
      orderRepo: {
        findById: async () => ({ ...baseOrder }),
        expirePending: async () => 0,
      },
      productRepo: {
        release: async () => {
          throw new Error('stock must not be restored');
        },
      },
    });
    const service = new OrderService(orderRepo, cartRepo, productRepo, prisma);

    await service.expireOrder('order-1');

    expect(events).toEqual([]);
  });

  test('winning the expiry claim releases stock then expires the transaction', async () => {
    const events: string[] = [];
    const tx = {
      order: { updateMany: async () => ({ count: 1 }) },
      paymentTransaction: {
        findUnique: async () => ({ id: 'ptx-1' }),
        update: async ({ data }: { data: { status: string } }) => events.push(`ptx:${data.status}`),
      },
      productSizeStock: { updateMany: async () => {} },
      product: { update: async () => {} },
    };
    const prisma = {
      $transaction: async (fn: (t: unknown) => Promise<unknown>) => fn(tx),
    } as unknown as PrismaService;
    const { orderRepo, cartRepo, productRepo } = makeRepos({
      orderRepo: {
        findById: async () => ({ ...baseOrder }),
        expirePending: async () => 1,
      },
      productRepo: {
        release: async () => events.push('release'),
      },
    });
    const service = new OrderService(orderRepo, cartRepo, productRepo, prisma);

    await service.expireOrder('order-1');

    expect(events).toEqual(['release', 'ptx:EXPIRED']);
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

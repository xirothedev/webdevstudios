import { describe, expect, test } from 'bun:test';

import { OrderRepo } from '@/orders/repo';

import { OrderExpirationScheduler } from './order-expiration.scheduler';
import { OrderService } from '../services/orders.service';

const makeRepo = (orders: Array<{ id: string; code: string }>): OrderRepo =>
  ({
    findExpiredPendingOrders: async () => orders,
  }) as unknown as OrderRepo;

const makeService = (failsFor: Set<string>) => {
  const calls: string[] = [];
  const service = {
    expireOrder: async (id: string) => {
      calls.push(id);
      if (failsFor.has(id)) {
        throw new Error(`boom ${id}`);
      }
    },
  };
  return { calls, service: service as unknown as OrderService };
};

describe('OrderExpirationScheduler.handleExpiredOrders', () => {
  test('sweeps every expired order even when one fails', async () => {
    const repo = makeRepo([
      { id: 'o1', code: '#A' },
      { id: 'o2', code: '#B' },
    ]);
    const { calls, service } = makeService(new Set(['o2']));
    const scheduler = new OrderExpirationScheduler(repo, service);

    await scheduler.handleExpiredOrders();

    expect(calls).toEqual(['o1', 'o2']);
  });

  test('does nothing when no orders are expired', async () => {
    const repo = makeRepo([]);
    const { calls, service } = makeService(new Set());
    const scheduler = new OrderExpirationScheduler(repo, service);

    await scheduler.handleExpiredOrders();

    expect(calls).toEqual([]);
  });
});

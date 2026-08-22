import { describe, expect, test } from 'bun:test';

import type { SecurityLoggerService } from '@/common/services';
import type { OrderRepo } from '@/orders/repo';
import type { ProductRepo } from '@/products/repo';

import type { PaymentRepo } from '../repo';
import { PaymentsService, type PayOSWebhookBody } from './payments.service';
import type { PayOSService } from './payos.service';

// ponytail: hand-rolled fakes per repo-seam rule; swap for a builder if this file grows past ~150 lines
const webhookBody = (code: string): PayOSWebhookBody => ({
  code: '00',
  desc: 'success',
  success: true,
  data: {
    orderCode: 1234,
    amount: 299000,
    description: 'Thanh toan',
    accountNumber: '123',
    reference: 'ref',
    transactionDateTime: '2026-01-01',
    currency: 'VND',
    paymentLinkId: 'link-1',
    code,
    desc: 'ok',
  },
  signature: 'sig',
});

const makeDeps = (overrides: Record<string, Record<string, unknown>> = {}) => {
  const calls: string[] = [];
  const paymentRepo = {
    findByTransactionCode: async () => ({
      id: 'tx-1',
      orderId: 'order-1',
      transactionCode: 'link-1',
      status: 'PENDING',
      order: {
        id: 'order-1',
        code: '#ORD-1234',
        userId: 'u1',
        items: [{ productId: 'p1', size: null, quantity: 2 }],
      },
    }),
    updateStatus: async () => calls.push('tx-update'),
    ...overrides.paymentRepo,
  } as unknown as PaymentRepo;
  const orderRepo = {
    updatePaymentStatus: async () => calls.push('payment-status'),
    updateStatus: async () => calls.push('status'),
    ...overrides.orderRepo,
  } as unknown as OrderRepo;
  const productRepo = {
    incrementStock: async () => calls.push('increment-stock'),
    incrementSizeStock: async () => calls.push('increment-size-stock'),
    ...overrides.productRepo,
  } as unknown as ProductRepo;
  const payOSService = {
    verifyWebhook: async (body: PayOSWebhookBody) => ({ code: body.data.code, data: body.data }),
    ...overrides.payOSService,
  } as unknown as PayOSService;
  const securityLogger = {
    logWebhookSignatureFailure: async () => {},
  } as unknown as SecurityLoggerService;
  return {
    calls,
    service: new PaymentsService(paymentRepo, orderRepo, productRepo, payOSService, securityLogger),
  };
};

describe('PaymentsService.processWebhook', () => {
  test('success code marks transaction PAID and order CONFIRMED without stock restore', async () => {
    const { calls, service } = makeDeps();

    await service.processWebhook(webhookBody('00'));

    expect(calls).toEqual(['tx-update', 'payment-status', 'status']);
  });

  test('failed code cancels the order and restores stock', async () => {
    const { calls, service } = makeDeps();

    await service.processWebhook(webhookBody('01'));

    expect(calls).toEqual(['tx-update', 'payment-status', 'status', 'increment-stock']);
  });

  test('already-paid transactions are ignored (idempotency)', async () => {
    const { calls, service } = makeDeps({
      paymentRepo: {
        findByTransactionCode: async () => ({
          id: 'tx-1',
          status: 'PAID',
          order: { id: 'o', code: 'c', items: [] },
        }),
      },
    });

    await service.processWebhook(webhookBody('00'));

    expect(calls).toEqual([]);
  });
});

import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { describe, expect, test } from 'bun:test';

import type { SecurityLoggerService } from '@/common/services';
import type { OrderService } from '@/orders/services/orders.service';
import type { OrderRepo } from '@/orders/repo';

import type { PaymentRepo } from '../repo';
import { PaymentsService, type PayOSWebhookBody } from './payments.service';
import type { PayOSService } from './payos.service';

// ponytail: hand-rolled fakes per repo-seam rule; swap for a builder if this file grows past ~150 lines
const webhookBody = (code: string, amount = 299000): PayOSWebhookBody => ({
  code: '00',
  desc: 'success',
  success: true,
  data: {
    orderCode: 1234,
    amount,
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

const payableOrder = {
  id: 'order-1',
  code: '#ORD-1234',
  paymentStatus: 'PENDING',
  totalAmount: 329000,
  items: [{ productName: 'Áo thun', quantity: 1, price: 299000 }],
};

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
        totalAmount: 299000,
        items: [{ productId: 'p1', size: null, quantity: 2 }],
      },
    }),
    findByOrderId: async () => null,
    updateStatus: async () => calls.push('tx-update'),
    ...overrides.paymentRepo,
  } as unknown as PaymentRepo;
  const orderRepo = {
    findById: async () => ({ id: 'order-1', code: '#ORD-1234', totalAmount: 299000 }),
    updatePaymentStatus: async () => calls.push('payment-status'),
    updateStatus: async () => calls.push('status'),
    ...overrides.orderRepo,
  } as unknown as OrderRepo;
  const ordersService = {
    settle: async (_orderId: string, opts: { paid: boolean }) => {
      calls.push(`settle:${opts.paid}`);
      return { id: _orderId, status: opts.paid ? 'CONFIRMED' : 'CANCELLED' };
    },
    ...overrides.ordersService,
  } as unknown as OrderService;
  const payOSService = {
    verifyWebhook: async (body: PayOSWebhookBody) => ({ code: body.data.code, data: body.data }),
    ...overrides.payOSService,
  } as unknown as PayOSService;
  const securityLogger = {
    logWebhookSignatureFailure: async () => {},
    ...overrides.securityLogger,
  } as unknown as SecurityLoggerService;
  return {
    calls,
    securityLogger,
    service: new PaymentsService(
      paymentRepo,
      orderRepo,
      ordersService,
      payOSService,
      securityLogger,
    ),
  };
};

describe('PaymentsService.processWebhook', () => {
  test('success code delegates a paid settle', async () => {
    const { calls, service } = makeDeps();

    await service.processWebhook(webhookBody('00'));

    expect(calls).toEqual(['settle:true']);
  });

  test('failed code delegates an unpaid settle (restock handled by settle)', async () => {
    const { calls, service } = makeDeps();

    await service.processWebhook(webhookBody('01'));

    expect(calls).toEqual(['settle:false']);
  });

  test('failure webhook on an expired order loses the settle claim and writes nothing', async () => {
    const { calls, service } = makeDeps({
      ordersService: { settle: async () => null },
    });

    const settled = await service.processWebhook(webhookBody('01'));

    expect(calls).toEqual([]);
    expect(settled).toBe(false);
  });

  test('already-paid transactions return true (idempotency)', async () => {
    const { calls, service } = makeDeps({
      paymentRepo: {
        findByTransactionCode: async () => ({
          id: 'tx-1',
          status: 'PAID',
          order: { id: 'o', code: 'c', totalAmount: 299000, items: [] },
        }),
      },
    });

    const settled = await service.processWebhook(webhookBody('00'));

    expect(calls).toEqual([]);
    expect(settled).toBe(true);
  });

  test('invalid signatures are logged for security and rejected', async () => {
    let loggedPath: string | undefined;
    const securityLogger = {
      logWebhookSignatureFailure: async (path: string) => {
        loggedPath = path;
      },
    } as unknown as SecurityLoggerService;
    const payOSService = {
      verifyWebhook: async () => {
        throw new Error('signature mismatch');
      },
    } as unknown as PayOSService;
    const service = new PaymentsService(
      {} as never,
      {} as never,
      {} as never,
      payOSService,
      securityLogger,
    );

    await expect(service.processWebhook(webhookBody('00'))).rejects.toThrow(BadRequestException);
    expect(loggedPath).toBe('/v1/payments/webhook');
  });

  test('amount mismatch logs to SecurityLog and throws', async () => {
    let loggedPath: string | undefined;
    const { service } = makeDeps({
      securityLogger: {
        logWebhookSignatureFailure: async (path: string) => {
          loggedPath = path;
        },
      },
    });

    await expect(service.processWebhook(webhookBody('00', 99999))).rejects.toThrow(
      BadRequestException,
    );
    expect(loggedPath).toBe('/v1/payments/webhook/amount-mismatch');
  });

  test('unknown paymentLinkId throws NotFound', async () => {
    const { service } = makeDeps({
      paymentRepo: { findByTransactionCode: async () => null },
    });

    await expect(service.processWebhook(webhookBody('00'))).rejects.toThrow(NotFoundException);
  });
});

describe('PaymentsService.createPaymentLink', () => {
  test('missing order throws NotFound', async () => {
    const { service } = makeDeps({
      orderRepo: { findById: async () => null },
    });

    await expect(service.createPaymentLink('order-404')).rejects.toThrow(NotFoundException);
  });

  test('already-paid order throws Conflict', async () => {
    const { service } = makeDeps({
      orderRepo: { findById: async () => ({ ...payableOrder, paymentStatus: 'PAID' }) },
    });

    await expect(service.createPaymentLink('order-1')).rejects.toThrow(ConflictException);
  });

  test('pending transaction with a URL returns it without contacting PayOS', async () => {
    let linkCreated = false;
    const { calls, service } = makeDeps({
      paymentRepo: {
        findByOrderId: async () => ({
          status: 'PENDING',
          paymentUrl: 'https://pay existing',
          transactionCode: 'existing-tx',
        }),
        create: async () => {
          linkCreated = true;
          return {};
        },
      },
      payOSService: {
        createPaymentLink: async () => {
          linkCreated = true;
          return {};
        },
      },
    });

    const result = await service.createPaymentLink('order-1');

    expect(result).toEqual({
      paymentUrl: 'https://pay existing',
      transactionCode: 'existing-tx',
    });
    expect(linkCreated).toBe(false);
    expect(calls).toEqual([]);
  });

  test('settled existing transaction throws Conflict', async () => {
    const { service } = makeDeps({
      paymentRepo: {
        findByOrderId: async () => ({ status: 'PAID', paymentUrl: null }),
      },
    });

    await expect(service.createPaymentLink('order-1')).rejects.toThrow(ConflictException);
  });

  test('unconfigured return/cancel URLs throw BadRequest', async () => {
    const { returnUrl, cancelUrl } = process.env as { returnUrl?: string; cancelUrl?: string };
    delete process.env.PAYOS_RETURN_URL;
    delete process.env.PAYOS_CANCEL_URL;
    try {
      const { service } = makeDeps({
        orderRepo: { findById: async () => payableOrder },
      });

      await expect(service.createPaymentLink('order-1')).rejects.toThrow(BadRequestException);
    } finally {
      process.env.PAYOS_RETURN_URL = returnUrl ?? '';
      process.env.PAYOS_CANCEL_URL = cancelUrl ?? '';
    }
  });

  test('happy path creates a PayOS link and stores a pending transaction', async () => {
    const created: Record<string, unknown> = {};
    let linkArgs: Record<string, unknown> = {};
    const { service } = makeDeps({
      orderRepo: { findById: async () => payableOrder },
      paymentRepo: {
        findByOrderId: async () => null,
        create: async (data: Record<string, unknown>) => {
          Object.assign(created, data);
          return data;
        },
      },
      payOSService: {
        createPaymentLink: async (args: Record<string, unknown>) => {
          linkArgs = args;
          return { paymentUrl: 'https://pay.new', transactionCode: 'tx-new' };
        },
      },
    });
    process.env.PAYOS_RETURN_URL ||= 'https://shop.example/return';
    process.env.PAYOS_CANCEL_URL ||= 'https://shop.example/cancel';

    const result = await service.createPaymentLink('order-1');

    expect(result).toEqual({ paymentUrl: 'https://pay.new', transactionCode: 'tx-new' });
    expect(linkArgs.orderCode).toBe('1234');
    expect(linkArgs.amount).toBe(329000);
    expect(created).toMatchObject({
      orderId: 'order-1',
      transactionCode: 'tx-new',
      amount: 329000,
      status: 'PENDING',
      paymentUrl: 'https://pay.new',
    });
  });
});

describe('PaymentsService misc', () => {
  test('order codes without trailing digits fall back to a stable hash', async () => {
    let linkArgs: Record<string, unknown> = {};
    const { service } = makeDeps({
      paymentRepo: {
        findByOrderId: async () => null,
        create: async () => ({}),
      },
      orderRepo: {
        findById: async () => ({ ...payableOrder, code: 'ORD-ABC' }),
      },
      payOSService: {
        createPaymentLink: async (args: Record<string, unknown>) => {
          linkArgs = args;
          return { paymentUrl: 'https://pay.new', transactionCode: 'tx-1' };
        },
      },
    });
    process.env.PAYOS_RETURN_URL ||= 'https://shop.example/return';
    process.env.PAYOS_CANCEL_URL ||= 'https://shop.example/cancel';

    await service.createPaymentLink('order-1');

    const orderCode = Number(linkArgs.orderCode);
    expect(Number.isInteger(orderCode)).toBe(true);
    expect(orderCode).toBeGreaterThan(0);
    expect(orderCode).toBeLessThan(1_000_000_000);
  });

  test('listTransactions forwards paging and status to the repo', async () => {
    const forwarded: unknown[][] = [];
    const { service } = makeDeps({
      paymentRepo: {
        listTransactions: async (...args: unknown[]) => {
          forwarded.push(args);
          return { transactions: [], pagination: { page: 2, limit: 25, total: 0, totalPages: 0 } };
        },
      },
    });

    const result = await service.listTransactions(2, 25, 'PAID' as never);

    expect(forwarded).toEqual([[2, 25, 'PAID']]);
    expect(result).toEqual({
      transactions: [],
      pagination: { page: 2, limit: 25, total: 0, totalPages: 0 },
    });
  });
});

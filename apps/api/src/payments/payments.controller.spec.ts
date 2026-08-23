import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, test, beforeEach } from 'bun:test';
import request from 'supertest';

import { PaymentsController } from './payments.controller';
import { PaymentsService, type PayOSWebhookBody } from './services/payments.service';

const webhookBody = (overrides: Partial<PayOSWebhookBody> = {}): PayOSWebhookBody => ({
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
    code: '00',
    desc: 'ok',
    ...overrides.data,
  },
  signature: 'sig',
  ...overrides,
});

describe('PaymentsController.handleWebhook', () => {
  let app: import('@nestjs/common').INestApplication;
  let service: {
    processWebhook: (body: PayOSWebhookBody) => Promise<boolean>;
    listTransactions: () => Promise<unknown>;
  };

  beforeEach(async () => {
    service = {
      processWebhook: async () => true,
      listTransactions: async () => ({
        transactions: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: service,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  test('POST with valid webhook returns 200 success', async () => {
    service.processWebhook = async () => true;

    const res = await request(app.getHttpServer()).post('/payments/webhook').send(webhookBody());

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  test('GET to webhook returns 404', async () => {
    const res = await request(app.getHttpServer()).get('/payments/webhook');

    expect(res.status).toBe(404);
  });

  test('forged unsigned webhook returns 400', async () => {
    service.processWebhook = async () => {
      throw new BadRequestException('Invalid webhook signature');
    };

    const res = await request(app.getHttpServer())
      .post('/payments/webhook')
      .send(webhookBody({ signature: '' }));

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid webhook signature');
  });

  test('valid webhook with wrong amount returns 400 and unsettles', async () => {
    service.processWebhook = async () => {
      throw new BadRequestException('Amount mismatch');
    };

    const res = await request(app.getHttpServer())
      .post('/payments/webhook')
      .send(webhookBody({ data: { amount: 99999 } as PayOSWebhookBody['data'] }));

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Amount mismatch');
  });

  test('valid webhook with processing error returns 500', async () => {
    service.processWebhook = async () => {
      throw new Error('Database connection failed');
    };

    const res = await request(app.getHttpServer()).post('/payments/webhook').send(webhookBody());

    expect(res.status).toBe(500);
  });

  test('replay of settled payment returns 200 no-op', async () => {
    service.processWebhook = async () => true;

    const res = await request(app.getHttpServer()).post('/payments/webhook').send(webhookBody());

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('unknown paymentLinkId returns 404', async () => {
    service.processWebhook = async () => {
      throw new NotFoundException('Payment transaction not found');
    };

    const res = await request(app.getHttpServer())
      .post('/payments/webhook')
      .send(webhookBody({ data: { paymentLinkId: 'unknown' } as PayOSWebhookBody['data'] }));

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Payment transaction not found');
  });
});

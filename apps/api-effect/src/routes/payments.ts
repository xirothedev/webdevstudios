import { Schema } from 'effect';
import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup } from 'effect/unstable/httpapi';

import { wrap, bodyOf } from '../lib/http';
import { goTime } from '../lib/util';
import { createLinkForOrder, processWebhook } from '../lib/payments';
import { bindBody, readJsonObject } from '../lib/validate';
import { requireAuth } from '../lib/auth';

const SuccessDto = Schema.Struct({ success: Schema.Boolean });

const PaymentLinkDto = Schema.Struct({
  paymentUrl: Schema.String,
  transactionCode: Schema.String,
});

const TransactionDto = Schema.Struct({
  id: Schema.String,
  orderId: Schema.String,
  transactionCode: Schema.String,
  amount: Schema.Number,
  status: Schema.String,
  paymentUrl: Schema.NullOr(Schema.String),
  createdAt: Schema.NullOr(Schema.String),
  updatedAt: Schema.NullOr(Schema.String),
});

export const paymentsGroup = HttpApiGroup.make('payments').add(
  HttpApiEndpoint.post('createLink', '/v1/payments/create-link', { success: PaymentLinkDto }),
  HttpApiEndpoint.post('webhook', '/v1/payments/webhook', { success: SuccessDto }),
  HttpApiEndpoint.get('verify', '/v1/payments/verify/:transactionCode', {
    success: Schema.Struct({ transactionCode: Schema.String, message: Schema.String }),
    params: Schema.Struct({ transactionCode: Schema.String }),
  }),
  HttpApiEndpoint.get('transactions', '/v1/payments/transactions', {
    success: Schema.Array(TransactionDto),
  }),
);

export const paymentsLocal = HttpApi.make('api-effect').add(paymentsGroup);

export const paymentsHandlers = HttpApiBuilder.group(paymentsLocal, 'payments', (h) =>
  h
    .handle(
      'createLink',
      wrap(true, async (ctx) => {
        await requireAuth(ctx);
        const in1 = bindBody(await bodyOf(ctx), {
          OrderId: { type: 'string', required: true },
        });
        const res = await createLinkForOrder(ctx.db, in1.orderId);
        ctx.setStatus(201);
        return res;
      }),
    )
    .handle(
      'webhook',
      wrap(true, async (ctx) => {
        const envelope = await readJsonObject(ctx.http);
        await processWebhook(ctx.db, envelope);
        return { success: true };
      }),
    )
    .handle(
      'verify',
      wrap(true, async (ctx) => ({
        transactionCode: ctx.param('transactionCode'),
        message: 'Use order endpoint to check status',
      })),
    )
    .handle(
      'transactions',
      wrap(true, async (ctx) => {
        await requireAuth(ctx);
        const rows = await ctx.db.paymentTransaction.findMany({
          orderBy: { createdAt: 'desc' },
          take: 100,
        });
        return rows.map((t) => ({
          id: t.id,
          orderId: t.orderId,
          transactionCode: t.transactionCode,
          amount: Number(t.amount),
          status: t.status,
          paymentUrl: t.paymentUrl,
          createdAt: goTime(t.createdAt),
          updatedAt: goTime(t.updatedAt),
        }));
      }),
    ),
);

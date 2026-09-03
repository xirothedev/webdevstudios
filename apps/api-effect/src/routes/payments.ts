import { HttpApiBuilder } from 'effect/unstable/httpapi';

import { api } from '../api';
import { wrap, bodyOf } from '../lib/http';
import { goTime } from '../lib/util';
import { createLinkForOrder, processWebhook } from '../lib/payments';
import { bindBody, readJsonObject } from '../lib/validate';
import { requireAuth } from '../lib/auth';

export const paymentsHandlers = HttpApiBuilder.group(api, 'payments', (h) =>
  h
    .handle(
      'createLink',
      wrap(true, async (ctx) => {
        await requireAuth(ctx);
        const in1 = bindBody<{ orderId?: string }>(await bodyOf(ctx), {
          OrderID: { type: 'string', required: true },
        });
        const res = await createLinkForOrder(ctx.db, in1.orderId!);
        ctx.status = 201;
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
        transactionCode: ctx.params.transactionCode,
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

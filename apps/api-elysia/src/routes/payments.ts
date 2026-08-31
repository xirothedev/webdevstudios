import { Elysia } from 'elysia';

import { goTime } from '../lib/util';
import { db } from '../lib/prisma';
import { createLinkForOrder, processWebhook } from '../lib/payments';
import { bindBody, readJsonObject } from '../lib/validate';
import { requireAuth } from '../lib/auth';

export const payments = new Elysia()
  .post('/payments/create-link', async ({ request, cookie, body, set }) => {
    await requireAuth({ request, cookie });
    const in1 = bindBody<{ orderId?: string }>(body as Record<string, unknown>, {
      OrderID: { type: 'string', required: true },
    });
    const res = await createLinkForOrder(db(), in1.orderId!);
    set.status = 201;
    return res;
  })
  .post('/payments/webhook', async ({ request }) => {
    const envelope = await readJsonObject(request);
    await processWebhook(db(), envelope);
    return { success: true };
  })
  .get('/payments/verify/:transactionCode', ({ params }) => ({
    transactionCode: params.transactionCode,
    message: 'Use order endpoint to check status',
  }))
  .get('/payments/transactions', async ({ request, cookie }) => {
    await requireAuth({ request, cookie });
    const rows = await db().paymentTransaction.findMany({
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
  });

export default payments;

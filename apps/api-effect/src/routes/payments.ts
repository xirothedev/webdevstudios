import { goTime } from '../lib/util';
import { db } from '../lib/prisma';
import { createLinkForOrder, processWebhook } from '../lib/payments';
import { bindBody, readJsonObject } from '../lib/validate';
import { requireAuth } from '../lib/auth';
import { route, bodyOf } from '../lib/http';

export const paymentsRoutes = [
  route('POST', '/payments/create-link', async (ctx) => {
    await requireAuth(ctx);
    const in1 = bindBody<{ orderId?: string }>(await bodyOf(ctx), {
      OrderID: { type: 'string', required: true },
    });
    const res = await createLinkForOrder(db(), in1.orderId!);
    ctx.status = 201;
    return res;
  }),
  route('POST', '/payments/webhook', async (ctx) => {
    const envelope = await readJsonObject(ctx.http);
    await processWebhook(db(), envelope);
    return { success: true };
  }),
  route('GET', '/payments/verify/:transactionCode', async (ctx) => ({
    transactionCode: ctx.params.transactionCode,
    message: 'Use order endpoint to check status',
  })),
  route('GET', '/payments/transactions', async (ctx) => {
    await requireAuth(ctx);
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
  }),
];

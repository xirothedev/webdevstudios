import { Elysia } from 'elysia';
import { Prisma, type Order } from '../generated/prisma/client';
import { ApiError } from '../lib/errors';
import { db } from '../lib/prisma';
import { PayosNotConfiguredError, createPaymentLink, verifyWebhookSignature } from '../lib/payos';
import { bindBody } from '../lib/validate';
import { requireAuth } from '../lib/auth';
import { goTime, newId } from '../lib/util';

// Mirrors payments.service.MarkPaid (admin mark-paid).
export async function markPaidOrder(orderID: string): Promise<void> {
  const order = await db().order.findUnique({ where: { id: orderID } });
  if (order === null) throw new ApiError(404, `Order with id ${orderID} not found`);
  if (order.paymentStatus === 'PAID') {
    throw new ApiError(409, 'Order is already paid');
  }
  const res = await db().order.updateMany({
    where: { id: orderID, status: 'PENDING' },
    data: {
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      updatedAt: new Date(),
    },
  });
  if (res.count === 0) {
    throw new ApiError(
      409,
      `Cannot mark paid order with status ${order.status}. Only PENDING orders can be marked paid.`,
    );
  }
  await db().paymentTransaction.updateMany({
    where: { orderId: orderID },
    data: { status: 'PAID', updatedAt: new Date() },
  });
}

async function createLinkForOrder(orderID: string) {
  const order = await db().order.findUnique({
    where: { id: orderID },
    include: { items: true },
  });
  if (order === null) throw new ApiError(404, `Order with id ${orderID} not found`);
  if (order.paymentStatus === 'PAID') {
    throw new ApiError(409, 'Order is already paid');
  }
  const existing = await db().paymentTransaction.findFirst({
    where: { orderId: order.id },
  });
  if (existing !== null) {
    if (
      existing.status === 'PENDING' &&
      existing.paymentUrl !== null &&
      existing.paymentUrl !== ''
    ) {
      return {
        paymentUrl: existing.paymentUrl,
        transactionCode: existing.transactionCode,
      };
    }
    throw new ApiError(409, 'Payment transaction already exists for this order');
  }
  const returnUrl = process.env.PAYOS_RETURN_URL ?? '';
  const cancelUrl = process.env.PAYOS_CANCEL_URL ?? '';
  if (returnUrl === '' || cancelUrl === '') {
    throw new ApiError(400, 'PAYOS_RETURN_URL and PAYOS_CANCEL_URL must be configured');
  }
  const items = order.items.map((it) => ({
    name: it.productName,
    quantity: it.quantity,
    price: Number(it.price),
  }));
  // ponytail: Go does ParseInt(code without '#') — "#ORD-0299" fails and yields 0.
  const orderCodeNum = Number.parseInt(order.code.replace('#', ''), 10) || 0;
  let result: Awaited<ReturnType<typeof createPaymentLink>>;
  try {
    result = await createPaymentLink(
      orderCodeNum,
      Number(order.totalAmount),
      `Thanh toan ${order.code}`,
      returnUrl,
      cancelUrl,
      items,
    );
  } catch (e) {
    if (e instanceof PayosNotConfiguredError) throw new ApiError(501, e.message);
    throw new ApiError(
      500,
      `Failed to create payment link: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
  await db().paymentTransaction.create({
    data: {
      id: newId(),
      orderId: order.id,
      transactionCode: result.paymentLinkId,
      amount: new Prisma.Decimal(Number(order.totalAmount)),
      status: 'PENDING',
      paymentUrl: result.checkoutUrl,
      payosData: result.raw as Prisma.InputJsonValue,
    },
  });
  return { paymentUrl: result.checkoutUrl, transactionCode: result.paymentLinkId };
}

// Signature gate -> amount gate -> single conditional settle claim.
async function processWebhook(envelope: Record<string, unknown>): Promise<boolean> {
  if (!verifyWebhookSignature(envelope)) {
    console.error('[SECURITY] invalid webhook signature');
    throw new ApiError(400, 'Invalid webhook signature');
  }
  const data: Record<string, unknown> =
    typeof envelope.data === 'object' && envelope.data !== null
      ? (envelope.data as Record<string, unknown>)
      : {};
  const success = envelope.success === true;
  const code = typeof data.code === 'string' ? data.code : '';
  const paymentLinkId = typeof data.paymentLinkId === 'string' ? data.paymentLinkId : '';
  const amount = typeof data.amount === 'number' ? data.amount : 0;

  const tx = await db().paymentTransaction.findFirst({
    where: { transactionCode: paymentLinkId },
  });
  if (tx === null) {
    console.log(`payments: webhook for unknown paymentLinkId ${paymentLinkId} — ignoring`);
    return false;
  }
  const order: Order | null = await db().order.findUnique({
    where: { id: tx.orderId },
  });
  if (order === null) {
    // mirrors Go: unknown order row is a hard error (500), not a silent skip
    throw new Error(`order ${tx.orderId} not found`);
  }
  if (amount !== Number(order.totalAmount)) {
    // CONTEXT.md invariant: amount mismatch logs and never settles.
    console.error(
      `[SECURITY] webhook amount ${amount} != order total ${Number(order.totalAmount)} for ${order.code}`,
    );
    return false;
  }
  const settled = await db().order.updateMany({
    where: { id: order.id, status: 'PENDING' },
    data: success
      ? {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          updatedAt: new Date(),
        }
      : {
          status: 'CANCELLED',
          paymentStatus: 'FAILED',
          updatedAt: new Date(),
        },
  });
  let txStatus: 'PAID' | 'FAILED' | 'CANCELLED' = 'FAILED';
  if (success && code === '00' && settled.count > 0) txStatus = 'PAID';
  else if (!success) txStatus = 'CANCELLED';
  await db().paymentTransaction.updateMany({
    where: { id: tx.id },
    data: { status: txStatus, updatedAt: new Date() },
  });
  return success && settled.count > 0;
}

// ponytail: Go web.Binds into map[string]any — any JSON object accepted, arrays rejected.
async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (text.trim() === '') throw new ApiError(400, 'EOF');
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ApiError(400, 'Malformed JSON body');
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new ApiError(
      400,
      `json: cannot unmarshal ${Array.isArray(parsed) ? 'array' : typeof parsed} into Go value of type map[string]interface {}`,
    );
  }
  return parsed as Record<string, unknown>;
}

export const payments = new Elysia()
  .post('/payments/create-link', async ({ request, cookie, body, set }) => {
    await requireAuth({ request, cookie });
    const in1 = bindBody<{ orderId?: string }>(body as Record<string, unknown>, {
      OrderID: { type: 'string', required: true },
    });
    const res = await createLinkForOrder(in1.orderId!);
    set.status = 201;
    return res;
  })
  .post('/payments/webhook', async ({ request }) => {
    const envelope = await readJsonObject(request);
    await processWebhook(envelope);
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

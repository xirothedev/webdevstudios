import { Prisma, type Order } from '../generated/prisma/client';

import { ApiError } from './errors';
import { PayosNotConfiguredError, createPaymentLink, verifyWebhookSignature } from './payos';
import type { DatabaseClient } from './prisma';
import { settleOrder } from './settle';
import { newId } from './util';

export async function createLinkForOrder(db: DatabaseClient, orderID: string) {
  const order = await db.order.findUnique({
    where: { id: orderID },
    include: { items: true },
  });
  if (order === null) throw new ApiError(404, `Order with id ${orderID} not found`);
  if (order.paymentStatus === 'PAID') {
    throw new ApiError(409, 'Order is already paid');
  }
  const existing = await db.paymentTransaction.findFirst({
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
  await db.paymentTransaction.create({
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
export async function processWebhook(
  db: DatabaseClient,
  envelope: Record<string, unknown>,
): Promise<boolean> {
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

  const tx = await db.paymentTransaction.findFirst({
    where: { transactionCode: paymentLinkId },
  });
  if (tx === null) {
    console.warn(`payments: webhook for unknown paymentLinkId ${paymentLinkId} — ignoring`);
    return false;
  }
  const order: Order | null = await db.order.findUnique({
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
  const claimed = await settleOrder(db, {
    orderId: order.id,
    paid: success,
    txStatus: success ? (code === '00' ? 'PAID' : 'FAILED') : 'CANCELLED',
    txId: tx.id,
    lostTxStatus: success ? 'FAILED' : 'CANCELLED',
  });
  return success && claimed;
}

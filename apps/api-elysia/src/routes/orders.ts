import { Elysia } from 'elysia';
import {
  Prisma,
  type Order,
  type OrderItem,
  type ProductSlug,
  type ProductSize,
  type ShippingAddress,
} from '../generated/prisma/client';
import { ApiError } from '../lib/errors';
import { db } from '../lib/prisma';
import { bindBody } from '../lib/validate';
import { requireAuth, requireAdmin } from '../lib/auth';
import { goTime, newId, paging } from '../lib/util';
import { availableStock, clearCart, getOrCreateCart } from './cart';

export const VALID_ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPING',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
] as const;

function assertValidStatus(status: string | undefined): void {
  if (status && !(VALID_ORDER_STATUSES as readonly string[]).includes(status)) {
    throw new ApiError(
      400,
      'status must be one of PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, CANCELLED, RETURNED',
    );
  }
}

type OrderWithRelations = Order & {
  shippingAddress: ShippingAddress;
  items: OrderItem[];
};

function orderById(id: string) {
  return db().order.findUnique({
    where: { id },
    include: { shippingAddress: true, items: true },
  });
}

function toDTO(o: OrderWithRelations) {
  return {
    id: o.id,
    code: o.code,
    status: o.status,
    paymentStatus: o.paymentStatus,
    totalAmount: Number(o.totalAmount),
    shippingFee: Number(o.shippingFee),
    discountValue: Number(o.discountValue),
    shippingAddress: {
      fullName: o.shippingAddress.fullName,
      phone: o.shippingAddress.phone,
      addressLine1: o.shippingAddress.addressLine1,
      addressLine2: o.shippingAddress.addressLine2,
      city: o.shippingAddress.city,
      district: o.shippingAddress.district,
      ward: o.shippingAddress.ward,
      postalCode: o.shippingAddress.postalCode,
    },
    items: o.items.map((it) => ({
      id: it.id,
      productId: it.productId,
      productSlug: it.productSlug,
      productName: it.productName,
      size: it.size,
      price: Number(it.price),
      quantity: it.quantity,
      subtotal: Number(it.price) * it.quantity,
    })),
    createdAt: goTime(o.createdAt),
    updatedAt: goTime(o.updatedAt),
  };
}

function sizeSuffix(size: string | null | undefined): string {
  return size ? ` (${size})` : '';
}

type StockItem = { productId: string; size: ProductSize | null; quantity: number };

// ponytail: random #ORD-NNNN with collision retry, mirrors Go generateOrderCode.
async function generateOrderCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = `#ORD-${String(Math.floor(Math.random() * 65536)).padStart(4, '0')}`;
    const existing = await db().order.findFirst({ where: { code } });
    if (existing === null) return code;
  }
  throw new Error('could not generate unique order code');
}

// Conditional decrement — WHERE stock >= qty makes oversell impossible.
async function reserveStock(tx: Prisma.TransactionClient, items: StockItem[]): Promise<void> {
  for (const it of items) {
    if (it.size === null) {
      const res = await tx.product.updateMany({
        where: { id: it.productId, stock: { gte: it.quantity } },
        data: { stock: { decrement: it.quantity }, updatedAt: new Date() },
      });
      if (res.count === 0) {
        throw new ApiError(409, `Insufficient stock for product ${it.productId}`);
      }
      continue;
    }
    const res = await tx.productSizeStock.updateMany({
      where: { productId: it.productId, size: it.size },
      data: { stock: { decrement: it.quantity }, updatedAt: new Date() },
    });
    if (res.count === 0) {
      throw new ApiError(409, `Insufficient stock for size ${it.size} of product ${it.productId}`);
    }
    await tx.product.update({
      where: { id: it.productId },
      data: { stock: { decrement: it.quantity }, updatedAt: new Date() },
    });
  }
}

async function releaseStock(tx: Prisma.TransactionClient, items: StockItem[]): Promise<void> {
  for (const it of items) {
    if (it.size === null) {
      await tx.product.update({
        where: { id: it.productId },
        data: { stock: { increment: it.quantity }, updatedAt: new Date() },
      });
      continue;
    }
    await tx.productSizeStock.update({
      where: { productId_size: { productId: it.productId, size: it.size } },
      data: { stock: { increment: it.quantity }, updatedAt: new Date() },
    });
    await tx.product.update({
      where: { id: it.productId },
      data: { stock: { increment: it.quantity }, updatedAt: new Date() },
    });
  }
}

type CreateOrderInput = {
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    district: string;
    ward: string;
    postalCode: string;
  };
  orderType: string;
  productId?: string | null;
  productSlug?: string | null;
  size?: string | null;
  quantity?: number | null;
};

async function createOrder(userId: string, in1: CreateOrderInput) {
  const pending = await db().order.count({
    where: { userId, status: 'PENDING', paymentStatus: 'PENDING' },
  });
  if (pending > 0) {
    const first = await db().order.findFirst({
      where: { userId, status: 'PENDING', paymentStatus: 'PENDING' },
    });
    throw new ApiError(
      409,
      `You have a pending order. Please complete or cancel it before creating a new one. Order ID: ${first!.id}`,
    );
  }

  let total = 0;
  const orderItems: Array<{
    id: string;
    productId: string | null;
    productSlug: ProductSlug;
    productName: string;
    size: ProductSize | null;
    price: Prisma.Decimal;
    quantity: number;
  }> = [];
  const stockItems: StockItem[] = [];

  if (in1.orderType === 'FROM_CART') {
    const c = await getOrCreateCart(userId);
    const items = await db().cartItem.findMany({
      where: { cartId: c.id },
      include: { product: { include: { sizeStocks: true } } },
    });
    if (items.length === 0) throw new ApiError(400, 'Cart is empty');
    for (const ci of items) {
      const { stock: available, ok } = availableStock(ci.product, ci.size);
      if (!ok || available < ci.quantity) {
        throw new ApiError(
          409,
          `Insufficient stock for ${ci.product.name}${sizeSuffix(ci.size)}. Available: ${Math.max(0, available)}, Requested: ${ci.quantity}`,
        );
      }
      total += Number(ci.product.priceCurrent) * ci.quantity;
      orderItems.push({
        id: newId(),
        productId: ci.productId,
        productSlug: ci.product.slug,
        productName: ci.product.name,
        size: ci.size,
        price: new Prisma.Decimal(Number(ci.product.priceCurrent)),
        quantity: ci.quantity,
      });
      stockItems.push({
        productId: ci.productId,
        size: ci.size,
        quantity: ci.quantity,
      });
    }
  } else if (in1.orderType === 'DIRECT_PURCHASE') {
    if (
      !in1.productId ||
      !in1.productSlug ||
      in1.quantity === undefined ||
      in1.quantity === null ||
      in1.quantity <= 0
    ) {
      throw new ApiError(
        400,
        'productId, productSlug and quantity are required for direct purchase',
      );
    }
    const p = await db().product.findUnique({
      where: { id: in1.productId },
      include: { sizeStocks: true },
    });
    if (p === null) {
      throw new ApiError(404, `Product with id ${in1.productId} not found`);
    }
    const { stock: available, ok } = availableStock(p, (in1.size ?? null) as ProductSize | null);
    if (!ok || available < in1.quantity) {
      throw new ApiError(
        409,
        `Insufficient stock for ${p.name}${sizeSuffix(in1.size)}. Available: ${Math.max(0, available)}, Requested: ${in1.quantity}`,
      );
    }
    total = Number(p.priceCurrent) * in1.quantity;
    orderItems.push({
      id: newId(),
      productId: in1.productId,
      productSlug: in1.productSlug as ProductSlug,
      productName: p.name,
      size: (in1.size ?? null) as ProductSize | null,
      price: new Prisma.Decimal(Number(p.priceCurrent)),
      quantity: in1.quantity,
    });
    stockItems.push({
      productId: in1.productId,
      size: (in1.size ?? null) as ProductSize | null,
      quantity: in1.quantity,
    });
  } else {
    throw new ApiError(400, `Invalid order type: ${in1.orderType}`);
  }

  const shippingFee = total >= 500000 ? 0 : 30000;
  const finalAmount = total + shippingFee;
  const code = await generateOrderCode();
  const addrId = newId();
  const orderId = newId();

  await db().$transaction(async (tx) => {
    await tx.shippingAddress.create({
      data: {
        id: addrId,
        fullName: in1.shippingAddress.fullName,
        phone: in1.shippingAddress.phone,
        addressLine1: in1.shippingAddress.addressLine1,
        addressLine2: in1.shippingAddress.addressLine2 ?? null,
        city: in1.shippingAddress.city,
        district: in1.shippingAddress.district,
        ward: in1.shippingAddress.ward,
        postalCode: in1.shippingAddress.postalCode,
      },
    });
    await tx.order.create({
      data: {
        id: orderId,
        userId,
        code,
        totalAmount: new Prisma.Decimal(finalAmount),
        shippingFee: new Prisma.Decimal(shippingFee),
        discountValue: new Prisma.Decimal(0),
        shippingAddressId: addrId,
        items: { create: orderItems },
      },
    });
    await reserveStock(tx, stockItems);
  });

  if (in1.orderType === 'FROM_CART') {
    try {
      await clearCart(userId);
    } catch (e) {
      console.error(`orders: order ${orderId} created but cart clear failed:`, e);
    }
  }

  const created = await orderById(orderId);
  if (created === null) throw new Error('order create verify failed');
  return toDTO(created);
}

async function listOrders(userId: string, page: number, limit: number, status?: string) {
  const where = {
    userId,
    ...(status ? { status: status as Order['status'] } : {}),
  };
  const total = await db().order.count({ where });
  const rows = await db().order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
    include: { shippingAddress: true, items: true },
  });
  return { orders: rows.map(toDTO), total };
}

async function getOrder(orderID: string, userId: string, role: string) {
  const o = await orderById(orderID);
  if (o === null) throw new ApiError(404, `Order with id ${orderID} not found`);
  if (o.userId !== userId && role !== 'ADMIN') {
    throw new ApiError(403, 'Order does not belong to user');
  }
  return toDTO(o);
}

async function cancelOrder(orderID: string, userId: string) {
  const o = await orderById(orderID);
  if (o === null) throw new ApiError(404, `Order with id ${orderID} not found`);
  if (o.userId !== userId) {
    throw new ApiError(403, 'Order does not belong to user');
  }
  if (o.status !== 'PENDING') {
    throw new ApiError(
      400,
      `Cannot cancel order with status ${o.status}. Only PENDING orders can be cancelled.`,
    );
  }
  const items: StockItem[] = o.items
    .filter((it) => it.productId !== null)
    .map((it) => ({
      productId: it.productId!,
      size: it.size,
      quantity: it.quantity,
    }));
  try {
    await db().$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: { id: orderID, status: 'PENDING' },
        data: { status: 'CANCELLED', updatedAt: new Date() },
      });
      if (claimed.count === 0) throw new Error('not-claimed');
      await releaseStock(tx, items);
    });
  } catch (e) {
    if (e instanceof Error && e.message === 'not-claimed') {
      throw new ApiError(
        400,
        'Cannot cancel order with status PENDING. Only PENDING orders can be cancelled.',
      );
    }
    throw e;
  }
  const fresh = await orderById(orderID);
  if (fresh === null) throw new Error('order cancel verify failed');
  return toDTO(fresh);
}

async function adminUpdateStatus(orderID: string, status: string) {
  if (!(VALID_ORDER_STATUSES as readonly string[]).includes(status)) {
    throw new ApiError(
      400,
      'status must be one of PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, CANCELLED, RETURNED',
    );
  }
  const res = await db().order.updateMany({
    where: { id: orderID },
    data: { status: status as Order['status'], updatedAt: new Date() },
  });
  if (res.count === 0) throw new ApiError(404, `Order with id ${orderID} not found`);
  const o = await orderById(orderID);
  if (o === null) throw new Error('order status verify failed');
  return toDTO(o);
}

// NestJS OrderExpirationScheduler equivalent: PENDING+PENDING older than 15 min -> CANCELLED/FAILED + release stock.
export async function sweepExpiredOrders(): Promise<number> {
  const cutoff = new Date(Date.now() - 15 * 60 * 1000);
  const rows = await db().order.findMany({
    where: {
      status: 'PENDING',
      paymentStatus: 'PENDING',
      createdAt: { lt: cutoff },
    },
    include: { items: true },
  });
  let n = 0;
  for (const o of rows) {
    const items: StockItem[] = o.items
      .filter((it) => it.productId !== null)
      .map((it) => ({ productId: it.productId!, size: it.size, quantity: it.quantity }));
    try {
      await db().$transaction(async (tx) => {
        const claimed = await tx.order.updateMany({
          where: { id: o.id, status: 'PENDING', paymentStatus: 'PENDING' },
          data: {
            status: 'CANCELLED',
            paymentStatus: 'FAILED',
            updatedAt: new Date(),
          },
        });
        if (claimed.count === 0) throw new Error('not-claimed');
        await releaseStock(tx, items);
      });
      n += 1;
      console.warn(`orders: expired ${o.id} (${o.code}), stock restored`);
    } catch (e) {
      if (!(e instanceof Error && e.message === 'not-claimed')) {
        console.error(`orders: expire ${o.id} failed:`, e);
      }
    }
  }
  return n;
}

export const orders = new Elysia()
  .post('/orders', async ({ request, cookie, body, set }) => {
    const auth = await requireAuth({ request, cookie });
    const in1 = bindBody<CreateOrderInput>(body as Record<string, unknown>, {
      shippingAddress: {
        type: 'object',
        required: true,
        fields: {
          FullName: { type: 'string', required: true, maxLen: 100 },
          Phone: { type: 'string', required: true },
          AddressLine1: { type: 'string', required: true, maxLen: 200 },
          AddressLine2: { type: 'string' },
          City: { type: 'string', required: true, maxLen: 100 },
          District: { type: 'string', required: true, maxLen: 100 },
          Ward: { type: 'string', required: true, maxLen: 100 },
          PostalCode: { type: 'string', required: true },
        },
      },
      orderType: {
        type: 'string',
        required: true,
        oneOf: ['FROM_CART', 'DIRECT_PURCHASE'],
      },
      productId: { type: 'string' },
      productSlug: { type: 'string' },
      size: { type: 'string' },
      quantity: { type: 'number', integer: true },
    });
    const dto = await createOrder(auth.user.id, in1);
    set.status = 201;
    return dto;
  })
  .get('/orders', async ({ request, cookie, query }) => {
    const auth = await requireAuth({ request, cookie });
    const { page, limit } = paging(query.page, query.limit);
    assertValidStatus(query.status);
    return listOrders(auth.user.id, page, limit, query.status);
  })
  .get('/orders/:id', async ({ request, cookie, params }) => {
    const auth = await requireAuth({ request, cookie });
    return getOrder(params.id!, auth.user.id, auth.user.role);
  })
  .patch('/orders/:id/cancel', async ({ request, cookie, params }) => {
    const auth = await requireAuth({ request, cookie });
    return cancelOrder(params.id!, auth.user.id);
  })
  .get('/admin/orders/all', async ({ request, cookie, query }) => {
    await requireAdmin({ request, cookie });
    const { page, limit } = paging(query.page, query.limit);
    assertValidStatus(query.status);
    const where = {
      ...(query.status ? { status: query.status as Order['status'] } : {}),
    };
    const total = await db().order.count({ where });
    const rows = await db().order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { shippingAddress: true, items: true },
    });
    return { orders: rows.map(toDTO), total };
  })
  .get('/admin/orders/:id', async ({ request, cookie, params }) => {
    await requireAdmin({ request, cookie });
    return getOrder(params.id!, '', 'ADMIN');
  })
  .patch('/admin/orders/:id/status', async ({ request, cookie, body, params }) => {
    await requireAdmin({ request, cookie });
    const in1 = bindBody<{ status?: string }>(body as Record<string, unknown>, {
      status: { type: 'string', required: true },
    });
    return adminUpdateStatus(params.id!, in1.status!);
  })
  .post('/admin/orders/:id/mark-paid', async ({ request, cookie, params }) => {
    await requireAdmin({ request, cookie });
    await markPaidOrder(params.id!);
    return { success: true };
  });

export default orders;

async function markPaidOrder(orderID: string) {
  const order = await db().order.findUnique({ where: { id: orderID } });
  if (order === null) throw new ApiError(404, `Order with id ${orderID} not found`);
  if (order.paymentStatus === 'PAID') {
    throw new ApiError(409, 'Order is already paid');
  }
  const res = await db().order.updateMany({
    where: { id: orderID, status: 'PENDING' },
    data: { status: 'CONFIRMED', paymentStatus: 'PAID', updatedAt: new Date() },
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

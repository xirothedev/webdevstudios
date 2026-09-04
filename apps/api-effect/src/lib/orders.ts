import {
  Prisma,
  type Order,
  type OrderItem,
  type ProductSlug,
  type ProductSize,
  type ShippingAddress,
} from '../generated/prisma/client';
import { ApiError } from './errors';
import type { DatabaseClient } from './prisma';
import { goTime, newId } from './util';
import { availableStock, clearCart, getOrCreateCart, type ProductWithSizes } from './cart';
import { ORDER_EXPIRY_MS, releaseStock, reserveStock, settleOrder, type StockItem } from './settle';

// ponytail: mirrors apps/web/src/lib/shipping.ts — keep in sync
const FREE_SHIPPING_THRESHOLD = 500000;
const SHIPPING_FEE = 30000;

export const VALID_ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPING',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
] as const;

export function assertValidStatus(
  status: string | undefined,
): asserts status is (typeof VALID_ORDER_STATUSES)[number] | undefined {
  if (status && !(VALID_ORDER_STATUSES as readonly string[]).includes(status)) {
    throw new ApiError(
      400,
      'status must be one of PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, CANCELLED, RETURNED',
    );
  }
}

export type OrderWithRelations = Order & {
  shippingAddress: ShippingAddress;
  items: OrderItem[];
};

export type CreateOrderInput = {
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

export async function orderById(db: DatabaseClient, id: string) {
  return db.order.findUnique({
    where: { id },
    include: { shippingAddress: true, items: true },
  });
}

export function toDTO(o: OrderWithRelations) {
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

// ponytail: random #ORD-NNNN with collision retry, mirrors Go generateOrderCode.
async function generateOrderCode(db: DatabaseClient): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = `#ORD-${String(Math.floor(Math.random() * 65536)).padStart(4, '0')}`;
    const existing = await db.order.findFirst({ where: { code } });
    if (existing === null) return code;
  }
  throw new Error('could not generate unique order code');
}

export async function createOrder(db: DatabaseClient, userId: string, in1: CreateOrderInput) {
  const pending = await db.order.count({
    where: { userId, status: 'PENDING', paymentStatus: 'PENDING' },
  });
  if (pending > 0) {
    const first = await db.order.findFirst({
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
    const c = await getOrCreateCart(db, userId);
    const items = await db.cartItem.findMany({
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
    const p = await db.product.findUnique({
      where: { id: in1.productId },
      include: { sizeStocks: true },
    });
    if (p === null) {
      throw new ApiError(404, `Product with id ${in1.productId} not found`);
    }
    const { stock: available, ok } = availableStock(
      p as unknown as ProductWithSizes,
      (in1.size ?? null) as ProductSize | null,
    );
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
      // ponytail: productSlug/size are unvalidated enum pass-throughs — the DB
      // rejects invalid values with a 500, matching the Go mirror. Add explicit
      // 400s only if a caller starts sending untrusted enums.
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

  const shippingFee = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const finalAmount = total + shippingFee;
  const code = await generateOrderCode(db);
  const addrId = newId();
  const orderId = newId();

  await db.$transaction(async (tx) => {
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
      await clearCart(db, userId);
    } catch (e) {
      console.error(`orders: order ${orderId} created but cart clear failed:`, e);
    }
  }

  const created = await orderById(db, orderId);
  if (created === null) throw new Error('order create verify failed');
  return toDTO(created);
}

export async function listOrders(
  db: DatabaseClient,
  userId: string,
  page: number,
  limit: number,
  status?: string,
) {
  assertValidStatus(status);
  const where = {
    userId,
    ...(status ? { status } : {}),
  };
  const total = await db.order.count({ where });
  const rows = await db.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
    include: { shippingAddress: true, items: true },
  });
  return { orders: rows.map(toDTO), total };
}

export async function listAllOrders(
  db: DatabaseClient,
  page: number,
  limit: number,
  status?: string,
) {
  assertValidStatus(status);
  const where = status ? { status } : {};
  const total = await db.order.count({ where });
  const rows = await db.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
    include: { shippingAddress: true, items: true },
  });
  return { orders: rows.map(toDTO), total };
}

export async function getOrder(db: DatabaseClient, orderID: string, userId: string, role: string) {
  const o = await orderById(db, orderID);
  if (o === null) throw new ApiError(404, `Order with id ${orderID} not found`);
  if (o.userId !== userId && role !== 'ADMIN') {
    throw new ApiError(403, 'Order does not belong to user');
  }
  return toDTO(o);
}

export async function cancelOrder(db: DatabaseClient, orderID: string, userId: string) {
  const o = await orderById(db, orderID);
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
    await db.$transaction(async (tx) => {
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
  const fresh = await orderById(db, orderID);
  if (fresh === null) throw new Error('order cancel verify failed');
  return toDTO(fresh);
}

export async function adminUpdateStatus(db: DatabaseClient, orderID: string, status: string) {
  assertValidStatus(status);
  if (status === undefined) {
    throw new ApiError(
      400,
      'status must be one of PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, CANCELLED, RETURNED',
    );
  }
  const res = await db.order.updateMany({
    where: { id: orderID },
    data: { status, updatedAt: new Date() },
  });
  if (res.count === 0) throw new ApiError(404, `Order with id ${orderID} not found`);
  const o = await orderById(db, orderID);
  if (o === null) throw new Error('order status verify failed');
  return toDTO(o);
}

export async function markPaidOrder(db: DatabaseClient, orderID: string) {
  const order = await db.order.findUnique({ where: { id: orderID } });
  if (order === null) throw new ApiError(404, `Order with id ${orderID} not found`);
  if (order.paymentStatus === 'PAID') {
    throw new ApiError(409, 'Order is already paid');
  }
  const claimed = await settleOrder(db, { orderId: orderID, paid: true, txStatus: 'PAID' });
  if (!claimed) {
    throw new ApiError(
      409,
      `Cannot mark paid order with status ${order.status}. Only PENDING orders can be marked paid.`,
    );
  }
}

// NestJS OrderExpirationScheduler equivalent: PENDING+PENDING older than ORDER_EXPIRY_MS -> CANCELLED/FAILED + release stock.
export async function sweepExpiredOrders(db: DatabaseClient): Promise<number> {
  const cutoff = new Date(Date.now() - ORDER_EXPIRY_MS);
  const rows = await db.order.findMany({
    where: {
      status: 'PENDING',
      paymentStatus: 'PENDING',
      createdAt: { lt: cutoff },
    },
  });
  let n = 0;
  for (const o of rows) {
    try {
      if (await settleOrder(db, { orderId: o.id, paid: false })) {
        n += 1;
        console.warn(`orders: expired ${o.id} (${o.code}), stock restored`);
      }
    } catch (e) {
      console.error(`orders: expire ${o.id} failed:`, e);
    }
  }
  return n;
}

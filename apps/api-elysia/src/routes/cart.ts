import { Elysia } from 'elysia';
import type {
  Cart,
  CartItem,
  Product,
  ProductSize,
  ProductSizeStock,
} from '../generated/prisma/client';
import { ApiError } from '../lib/errors';
import { db } from '../lib/prisma';
import { bindBody } from '../lib/validate';
import { requireAuth } from '../lib/auth';
import { goTime, newId } from '../lib/util';

const IMAGE_MAP: Record<string, string> = {
  AO_THUN: '/shop/ao-thun.webp',
  PAD_CHUOT: '/shop/pad-chuot.webp',
  DAY_DEO: '/shop/day-deo.webp',
  MOC_KHOA: '/shop/moc-khoa.webp',
};

export function productImage(slug: string): string {
  return IMAGE_MAP[slug] ?? '/shop/default.webp';
}

type ProductWithSizes = Product & { sizeStocks: ProductSizeStock[] };
type CartItemRow = CartItem & { product: ProductWithSizes };

export function availableStock(
  p: ProductWithSizes,
  size: ProductSize | null,
): { stock: number; ok: boolean } {
  if (!p.hasSizes) return { stock: p.stock, ok: true };
  if (size === null) return { stock: 0, ok: false };
  const hit = p.sizeStocks.find((s) => s.size === size);
  return hit !== undefined ? { stock: hit.stock, ok: true } : { stock: 0, ok: false };
}

export async function getOrCreateCart(userId: string): Promise<Cart> {
  const existing = await db().cart.findFirst({ where: { userId } });
  if (existing !== null) return existing;
  return db().cart.create({ data: { id: newId(), userId } });
}

export async function clearCart(userId: string): Promise<void> {
  const cart = await getOrCreateCart(userId);
  await db().cartItem.deleteMany({ where: { cartId: cart.id } });
}

async function ownedItem(userId: string, itemID: string): Promise<CartItemRow> {
  const item = await db().cartItem.findUnique({
    where: { id: itemID },
    include: { product: { include: { sizeStocks: true } } },
  });
  if (item === null) throw new ApiError(404, `Cart item with id ${itemID} not found`);
  const cart = await getOrCreateCart(userId);
  if (item.cartId !== cart.id) {
    throw new ApiError(403, 'Cart item does not belong to user');
  }
  return item;
}

async function mapToCartDTO(cartID: string) {
  const items = await db().cartItem.findMany({
    where: { cartId: cartID },
    include: { product: { include: { sizeStocks: true } } },
  });
  const dtoItems = items.map((it) => {
    const { stock: available } = availableStock(it.product, it.size);
    const price = Number(it.product.priceCurrent);
    return {
      id: it.id,
      productId: it.productId,
      productName: it.product.name,
      productSlug: it.product.slug,
      productPrice: price,
      productImage: productImage(it.product.slug),
      size: it.size,
      quantity: it.quantity,
      subtotal: price * it.quantity,
      stockAvailable: available,
    };
  });
  const cart = await db().cart.findUnique({ where: { id: cartID } });
  return {
    id: cartID,
    items: dtoItems,
    totalItems: dtoItems.reduce((sum, i) => sum + i.quantity, 0),
    totalAmount: dtoItems.reduce((sum, i) => sum + i.subtotal, 0),
    updatedAt: goTime(cart?.updatedAt ?? null),
  };
}

export const cart = new Elysia()
  .get('/cart', async ({ request, cookie }) => {
    const auth = await requireAuth({ request, cookie });
    const c = await getOrCreateCart(auth.user.id);
    return mapToCartDTO(c.id);
  })
  .post('/cart/items', async ({ request, cookie, body, set }) => {
    const auth = await requireAuth({ request, cookie });
    const in1 = bindBody<{ productId: string; size?: string; quantity?: number }>(
      body as Record<string, unknown>,
      {
        productId: { type: 'string', required: true },
        size: { type: 'string' },
        quantity: { type: 'number', integer: true },
      },
    );
    const dto = await addToCart(auth.user.id, in1.productId, in1.size ?? null, in1.quantity ?? 0);
    set.status = 201;
    return dto;
  })
  .patch('/cart/items/:id', async ({ request, cookie, body, params }) => {
    const auth = await requireAuth({ request, cookie });
    const in1 = bindBody<{ quantity?: number }>(body as Record<string, unknown>, {
      quantity: { type: 'number', integer: true },
    });
    return updateCartItem(auth.user.id, params.id!, in1.quantity ?? 0);
  })
  .delete('/cart/items/:id', async ({ request, cookie, params }) => {
    const auth = await requireAuth({ request, cookie });
    return removeFromCart(auth.user.id, params.id!);
  })
  .delete('/cart', async ({ request, cookie }) => {
    const auth = await requireAuth({ request, cookie });
    const c = await getOrCreateCart(auth.user.id);
    await db().cartItem.deleteMany({ where: { cartId: c.id } });
    return mapToCartDTO(c.id);
  });

export default cart;

async function addToCart(userId: string, productID: string, size: string | null, quantity: number) {
  if (quantity <= 0) throw new ApiError(400, 'Quantity must be greater than 0');
  const p = await db().product.findUnique({
    where: { id: productID },
    include: { sizeStocks: true },
  });
  if (p === null) throw new ApiError(404, `Product with id ${productID} not found`);
  if (p.hasSizes && size === null) {
    throw new ApiError(400, 'Size is required for products with sizes');
  }
  if (!p.hasSizes && size !== null) {
    throw new ApiError(400, 'Size is not supported for this product');
  }
  const { stock: available, ok } = availableStock(p, (size ?? null) as ProductSize | null);
  if (!ok) throw new ApiError(404, `Size ${size} not found for product ${productID}`);
  const c = await getOrCreateCart(userId);
  const existing = await db().cartItem.findFirst({
    where: { cartId: c.id, productId: productID, size: (size ?? null) as ProductSize | null },
  });
  const current = existing?.quantity ?? 0;
  if (current + quantity > available) {
    throw new ApiError(
      409,
      `Insufficient stock. Available: ${available}, Requested: ${current + quantity}`,
    );
  }
  if (existing !== null) {
    await db().cartItem.update({
      where: { id: existing.id },
      data: { quantity: { increment: quantity } },
    });
  } else {
    await db().cartItem.create({
      data: {
        id: newId(),
        cartId: c.id,
        productId: productID,
        size: (size ?? null) as ProductSize | null,
        quantity,
      },
    });
  }
  return mapToCartDTO(c.id);
}

async function updateCartItem(userId: string, itemID: string, quantity: number) {
  if (quantity <= 0) throw new ApiError(400, 'Quantity must be greater than 0');
  const item = await ownedItem(userId, itemID);
  const { stock: available, ok } = availableStock(item.product, item.size);
  if (!ok) {
    throw new ApiError(404, `Size ${item.size} not found for product ${item.productId}`);
  }
  if (quantity > available) {
    throw new ApiError(409, `Insufficient stock. Available: ${available}, Requested: ${quantity}`);
  }
  await db().cartItem.update({ where: { id: itemID }, data: { quantity } });
  return mapToCartDTO(item.cartId);
}

async function removeFromCart(userId: string, itemID: string) {
  const item = await ownedItem(userId, itemID);
  await db().cartItem.delete({ where: { id: itemID } });
  return mapToCartDTO(item.cartId);
}

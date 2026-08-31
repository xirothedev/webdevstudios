import type {
  Cart,
  CartItem,
  Product,
  ProductSize,
  ProductSizeStock,
} from '../generated/prisma/client';
import { ApiError } from './errors';
import type { DatabaseClient } from './prisma';
import { goTime, newId } from './util';

const IMAGE_MAP: Record<string, string> = {
  AO_THUN: '/shop/ao-thun.webp',
  PAD_CHUOT: '/shop/pad-chuot.webp',
  DAY_DEO: '/shop/day-deo.webp',
  MOC_KHOA: '/shop/moc-khoa.webp',
};

export function productImage(slug: string): string {
  return IMAGE_MAP[slug] ?? '/shop/default.webp';
}

export type ProductWithSizes = Product & { sizeStocks: ProductSizeStock[] };
export type CartItemRow = CartItem & { product: ProductWithSizes };

export function availableStock(
  p: ProductWithSizes,
  size: ProductSize | null,
): { stock: number; ok: boolean } {
  if (!p.hasSizes) return { stock: p.stock, ok: true };
  if (size === null) return { stock: 0, ok: false };
  const hit = p.sizeStocks.find((s) => s.size === size);
  return hit !== undefined ? { stock: hit.stock, ok: true } : { stock: 0, ok: false };
}

export async function getOrCreateCart(db: DatabaseClient, userId: string): Promise<Cart> {
  const existing = await db.cart.findFirst({ where: { userId } });
  if (existing !== null) return existing;
  return db.cart.create({ data: { id: newId(), userId } });
}

export async function clearCart(db: DatabaseClient, userId: string): Promise<Cart> {
  const cart = await getOrCreateCart(db, userId);
  await db.cartItem.deleteMany({ where: { cartId: cart.id } });
  return cart;
}

async function ownedItem(db: DatabaseClient, userId: string, itemID: string): Promise<CartItemRow> {
  const item = await db.cartItem.findUnique({
    where: { id: itemID },
    include: { product: { include: { sizeStocks: true } } },
  });
  if (item === null) throw new ApiError(404, `Cart item with id ${itemID} not found`);
  const cart = await getOrCreateCart(db, userId);
  if (item.cartId !== cart.id) {
    throw new ApiError(403, 'Cart item does not belong to user');
  }
  return item;
}

export async function mapToCartDTO(db: DatabaseClient, cartID: string) {
  const items = await db.cartItem.findMany({
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
  const cart = await db.cart.findUnique({ where: { id: cartID } });
  return {
    id: cartID,
    items: dtoItems,
    totalItems: dtoItems.reduce((sum, i) => sum + i.quantity, 0),
    totalAmount: dtoItems.reduce((sum, i) => sum + i.subtotal, 0),
    updatedAt: goTime(cart?.updatedAt ?? null),
  };
}

export async function addToCart(
  db: DatabaseClient,
  userId: string,
  productID: string,
  size: string | null,
  quantity: number,
) {
  if (quantity <= 0) throw new ApiError(400, 'Quantity must be greater than 0');
  const p = await db.product.findUnique({
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
  const c = await getOrCreateCart(db, userId);
  const existing = await db.cartItem.findFirst({
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
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: { increment: quantity } },
    });
  } else {
    await db.cartItem.create({
      data: {
        id: newId(),
        cartId: c.id,
        productId: productID,
        size: (size ?? null) as ProductSize | null,
        quantity,
      },
    });
  }
  return mapToCartDTO(db, c.id);
}

export async function updateCartItem(
  db: DatabaseClient,
  userId: string,
  itemID: string,
  quantity: number,
) {
  if (quantity <= 0) throw new ApiError(400, 'Quantity must be greater than 0');
  const item = await ownedItem(db, userId, itemID);
  const { stock: available, ok } = availableStock(item.product, item.size);
  if (!ok) {
    throw new ApiError(404, `Size ${item.size} not found for product ${item.productId}`);
  }
  if (quantity > available) {
    throw new ApiError(409, `Insufficient stock. Available: ${available}, Requested: ${quantity}`);
  }
  await db.cartItem.update({ where: { id: itemID }, data: { quantity } });
  return mapToCartDTO(db, item.cartId);
}

export async function removeFromCart(db: DatabaseClient, userId: string, itemID: string) {
  const item = await ownedItem(db, userId, itemID);
  await db.cartItem.delete({ where: { id: itemID } });
  return mapToCartDTO(db, item.cartId);
}

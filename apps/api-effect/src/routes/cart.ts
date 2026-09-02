import { db } from '../lib/prisma';
import {
  addToCart,
  clearCart,
  getOrCreateCart,
  mapToCartDTO,
  removeFromCart,
  updateCartItem,
} from '../lib/cart';
import { bindBody } from '../lib/validate';
import { requireAuth } from '../lib/auth';
import { route, bodyOf } from '../lib/http';

export const cartRoutes = [
  route('GET', '/cart', async (ctx) => {
    const auth = await requireAuth(ctx);
    const c = await getOrCreateCart(db(), auth.user.id);
    return mapToCartDTO(db(), c.id);
  }),
  route('POST', '/cart/items', async (ctx) => {
    const auth = await requireAuth(ctx);
    const in1 = bindBody<{ productId: string; size?: string; quantity?: number }>(
      await bodyOf(ctx),
      {
        productId: { type: 'string', required: true },
        size: { type: 'string' },
        quantity: { type: 'number', integer: true },
      },
    );
    const dto = await addToCart(
      db(),
      auth.user.id,
      in1.productId,
      in1.size ?? null,
      in1.quantity ?? 0,
    );
    ctx.status = 201;
    return dto;
  }),
  route('PATCH', '/cart/items/:id', async (ctx) => {
    const auth = await requireAuth(ctx);
    const in1 = bindBody<{ quantity?: number }>(await bodyOf(ctx), {
      quantity: { type: 'number', integer: true },
    });
    return updateCartItem(db(), auth.user.id, ctx.params.id!, in1.quantity ?? 0);
  }),
  route('DELETE', '/cart/items/:id', async (ctx) => {
    const auth = await requireAuth(ctx);
    return removeFromCart(db(), auth.user.id, ctx.params.id!);
  }),
  route('DELETE', '/cart', async (ctx) => {
    const auth = await requireAuth(ctx);
    const c = await clearCart(db(), auth.user.id);
    return mapToCartDTO(db(), c.id);
  }),
];

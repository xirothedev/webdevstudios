import { Elysia } from 'elysia';

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

export const cart = new Elysia()
  .get('/cart', async ({ request, cookie }) => {
    const auth = await requireAuth({ request, cookie });
    const c = await getOrCreateCart(db(), auth.user.id);
    return mapToCartDTO(db(), c.id);
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
    const dto = await addToCart(
      db(),
      auth.user.id,
      in1.productId,
      in1.size ?? null,
      in1.quantity ?? 0,
    );
    set.status = 201;
    return dto;
  })
  .patch('/cart/items/:id', async ({ request, cookie, body, params }) => {
    const auth = await requireAuth({ request, cookie });
    const in1 = bindBody<{ quantity?: number }>(body as Record<string, unknown>, {
      quantity: { type: 'number', integer: true },
    });
    return updateCartItem(db(), auth.user.id, params.id!, in1.quantity ?? 0);
  })
  .delete('/cart/items/:id', async ({ request, cookie, params }) => {
    const auth = await requireAuth({ request, cookie });
    return removeFromCart(db(), auth.user.id, params.id!);
  })
  .delete('/cart', async ({ request, cookie }) => {
    const auth = await requireAuth({ request, cookie });
    const c = await clearCart(db(), auth.user.id);
    return mapToCartDTO(db(), c.id);
  });

export default cart;

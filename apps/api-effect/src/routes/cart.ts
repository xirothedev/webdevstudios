import { HttpApiBuilder } from 'effect/unstable/httpapi';

import { api } from '../api';
import { wrap, bodyOf } from '../lib/http';
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

export const cartHandlers = HttpApiBuilder.group(api, 'cart', (h) =>
  h
    .handle(
      'getCart',
      wrap(true, async (ctx) => {
        const auth = await requireAuth(ctx);
        const c = await getOrCreateCart(ctx.db, auth.user.id);
        return mapToCartDTO(ctx.db, c.id);
      }),
    )
    .handle(
      'addItem',
      wrap(true, async (ctx) => {
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
          ctx.db,
          auth.user.id,
          in1.productId,
          in1.size ?? null,
          in1.quantity ?? 0,
        );
        ctx.status = 201;
        return dto;
      }),
    )
    .handle(
      'updateItem',
      wrap(true, async (ctx) => {
        const auth = await requireAuth(ctx);
        const in1 = bindBody<{ quantity?: number }>(await bodyOf(ctx), {
          quantity: { type: 'number', integer: true },
        });
        return updateCartItem(ctx.db, auth.user.id, ctx.params.id!, in1.quantity ?? 0);
      }),
    )
    .handle(
      'removeItem',
      wrap(true, async (ctx) => {
        const auth = await requireAuth(ctx);
        return removeFromCart(ctx.db, auth.user.id, ctx.params.id!);
      }),
    )
    .handle(
      'clearCart',
      wrap(true, async (ctx) => {
        const auth = await requireAuth(ctx);
        const c = await clearCart(ctx.db, auth.user.id);
        return mapToCartDTO(ctx.db, c.id);
      }),
    ),
);

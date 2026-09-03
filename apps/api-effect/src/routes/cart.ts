import { Schema } from 'effect';
import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup } from 'effect/unstable/httpapi';

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
import { ProductSize } from '../generated/prisma/client';

const CartItemDto = Schema.Struct({
  id: Schema.String,
  productId: Schema.String,
  productName: Schema.String,
  productSlug: Schema.String,
  productPrice: Schema.Number,
  productImage: Schema.String,
  size: Schema.NullOr(Schema.Enum(ProductSize)),
  quantity: Schema.Number,
  subtotal: Schema.Number,
  stockAvailable: Schema.Number,
});

const CartDto = Schema.Struct({
  id: Schema.String,
  items: Schema.Array(CartItemDto),
  totalItems: Schema.Number,
  totalAmount: Schema.Number,
  updatedAt: Schema.NullOr(Schema.String),
});

const Id = { id: Schema.String };

export const cartGroup = HttpApiGroup.make('cart').add(
  HttpApiEndpoint.get('getCart', '/v1/cart', { success: CartDto }),
  HttpApiEndpoint.post('addItem', '/v1/cart/items', { success: CartDto }),
  HttpApiEndpoint.patch('updateItem', '/v1/cart/items/:id', {
    success: CartDto,
    params: Schema.Struct(Id),
  }),
  HttpApiEndpoint.delete('removeItem', '/v1/cart/items/:id', {
    success: CartDto,
    params: Schema.Struct(Id),
  }),
  HttpApiEndpoint.delete('clearCart', '/v1/cart', { success: CartDto }),
);

export const cartLocal = HttpApi.make('api-effect').add(cartGroup);

export const cartHandlers = HttpApiBuilder.group(cartLocal, 'cart', (h) =>
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
        const in1 = bindBody(await bodyOf(ctx), {
          productId: { type: 'string', required: true },
          size: { type: 'string' },
          quantity: { type: 'number', integer: true },
        });
        const dto = await addToCart(
          ctx.db,
          auth.user.id,
          in1.productId,
          in1.size ?? null,
          in1.quantity ?? 0,
        );
        ctx.setStatus(201);
        return dto;
      }),
    )
    .handle(
      'updateItem',
      wrap(true, async (ctx) => {
        const auth = await requireAuth(ctx);
        const in1 = bindBody(await bodyOf(ctx), {
          quantity: { type: 'number', integer: true },
        });
        return updateCartItem(ctx.db, auth.user.id, ctx.param('id'), in1.quantity ?? 0);
      }),
    )
    .handle(
      'removeItem',
      wrap(true, async (ctx) => {
        const auth = await requireAuth(ctx);
        return removeFromCart(ctx.db, auth.user.id, ctx.param('id'));
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

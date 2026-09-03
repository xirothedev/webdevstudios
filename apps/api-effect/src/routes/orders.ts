import { HttpApiBuilder } from 'effect/unstable/httpapi';

import { api } from '../api';
import { wrap, bodyOf } from '../lib/http';
import {
  adminUpdateStatus,
  assertValidStatus,
  cancelOrder,
  createOrder,
  getOrder,
  listAllOrders,
  listOrders,
  markPaidOrder,
  type CreateOrderInput,
} from '../lib/orders';
import { requireAdmin, requireAuth } from '../lib/auth';
import { bindBody } from '../lib/validate';
import { paging } from '../lib/util';

export const ordersHandlers = HttpApiBuilder.group(api, 'orders', (h) =>
  h
    .handle(
      'createOrder',
      wrap(true, async (ctx) => {
        const auth = await requireAuth(ctx);
        const in1 = bindBody<CreateOrderInput>(await bodyOf(ctx), {
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
        const dto = await createOrder(ctx.db, auth.user.id, in1);
        ctx.status = 201;
        return dto;
      }),
    )
    .handle(
      'listOrders',
      wrap(true, async (ctx) => {
        const auth = await requireAuth(ctx);
        const { page, limit } = paging(ctx.query.page, ctx.query.limit);
        assertValidStatus(ctx.query.status);
        return listOrders(ctx.db, auth.user.id, page, limit, ctx.query.status);
      }),
    )
    .handle(
      'getOrder',
      wrap(true, async (ctx) => {
        const auth = await requireAuth(ctx);
        return getOrder(ctx.db, ctx.params.id!, auth.user.id, auth.user.role);
      }),
    )
    .handle(
      'cancelOrder',
      wrap(true, async (ctx) => {
        const auth = await requireAuth(ctx);
        return cancelOrder(ctx.db, ctx.params.id!, auth.user.id);
      }),
    )
    .handle(
      'listAllOrders',
      wrap(true, async (ctx) => {
        await requireAdmin(ctx);
        const { page, limit } = paging(ctx.query.page, ctx.query.limit);
        assertValidStatus(ctx.query.status);
        return listAllOrders(ctx.db, page, limit, ctx.query.status);
      }),
    )
    .handle(
      'adminGetOrder',
      wrap(true, async (ctx) => {
        await requireAdmin(ctx);
        return getOrder(ctx.db, ctx.params.id!, '', 'ADMIN');
      }),
    )
    .handle(
      'adminUpdateStatus',
      wrap(true, async (ctx) => {
        await requireAdmin(ctx);
        const in1 = bindBody<{ status?: string }>(await bodyOf(ctx), {
          status: { type: 'string', required: true },
        });
        return adminUpdateStatus(ctx.db, ctx.params.id!, in1.status!);
      }),
    )
    .handle(
      'adminMarkPaid',
      wrap(true, async (ctx) => {
        await requireAdmin(ctx);
        await markPaidOrder(ctx.db, ctx.params.id!);
        return { success: true };
      }),
    ),
);

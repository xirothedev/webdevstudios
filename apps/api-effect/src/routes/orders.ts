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
import { db } from '../lib/prisma';
import { requireAdmin, requireAuth } from '../lib/auth';
import { bindBody } from '../lib/validate';
import { paging } from '../lib/util';
import { route, bodyOf } from '../lib/http';

export const ordersRoutes = [
  route('POST', '/orders', async (ctx) => {
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
    const dto = await createOrder(db(), auth.user.id, in1);
    ctx.status = 201;
    return dto;
  }),
  route('GET', '/orders', async (ctx) => {
    const auth = await requireAuth(ctx);
    const { page, limit } = paging(ctx.query.page, ctx.query.limit);
    assertValidStatus(ctx.query.status);
    return listOrders(db(), auth.user.id, page, limit, ctx.query.status);
  }),
  route('GET', '/orders/:id', async (ctx) => {
    const auth = await requireAuth(ctx);
    return getOrder(db(), ctx.params.id!, auth.user.id, auth.user.role);
  }),
  route('PATCH', '/orders/:id/cancel', async (ctx) => {
    const auth = await requireAuth(ctx);
    return cancelOrder(db(), ctx.params.id!, auth.user.id);
  }),
  route('GET', '/admin/orders/all', async (ctx) => {
    await requireAdmin(ctx);
    const { page, limit } = paging(ctx.query.page, ctx.query.limit);
    assertValidStatus(ctx.query.status);
    return listAllOrders(db(), page, limit, ctx.query.status);
  }),
  route('GET', '/admin/orders/:id', async (ctx) => {
    await requireAdmin(ctx);
    return getOrder(db(), ctx.params.id!, '', 'ADMIN');
  }),
  route('PATCH', '/admin/orders/:id/status', async (ctx) => {
    await requireAdmin(ctx);
    const in1 = bindBody<{ status?: string }>(await bodyOf(ctx), {
      status: { type: 'string', required: true },
    });
    return adminUpdateStatus(db(), ctx.params.id!, in1.status!);
  }),
  route('POST', '/admin/orders/:id/mark-paid', async (ctx) => {
    await requireAdmin(ctx);
    await markPaidOrder(db(), ctx.params.id!);
    return { success: true };
  }),
];

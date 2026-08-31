import { Elysia } from 'elysia';

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
    const dto = await createOrder(db(), auth.user.id, in1);
    set.status = 201;
    return dto;
  })
  .get('/orders', async ({ request, cookie, query }) => {
    const auth = await requireAuth({ request, cookie });
    const { page, limit } = paging(query.page, query.limit);
    assertValidStatus(query.status);
    return listOrders(db(), auth.user.id, page, limit, query.status);
  })
  .get('/orders/:id', async ({ request, cookie, params }) => {
    const auth = await requireAuth({ request, cookie });
    return getOrder(db(), params.id!, auth.user.id, auth.user.role);
  })
  .patch('/orders/:id/cancel', async ({ request, cookie, params }) => {
    const auth = await requireAuth({ request, cookie });
    return cancelOrder(db(), params.id!, auth.user.id);
  })
  .get('/admin/orders/all', async ({ request, cookie, query }) => {
    await requireAdmin({ request, cookie });
    const { page, limit } = paging(query.page, query.limit);
    assertValidStatus(query.status);
    return listAllOrders(db(), page, limit, query.status);
  })
  .get('/admin/orders/:id', async ({ request, cookie, params }) => {
    await requireAdmin({ request, cookie });
    return getOrder(db(), params.id!, '', 'ADMIN');
  })
  .patch('/admin/orders/:id/status', async ({ request, cookie, body, params }) => {
    await requireAdmin({ request, cookie });
    const in1 = bindBody<{ status?: string }>(body as Record<string, unknown>, {
      status: { type: 'string', required: true },
    });
    return adminUpdateStatus(db(), params.id!, in1.status!);
  })
  .post('/admin/orders/:id/mark-paid', async ({ request, cookie, params }) => {
    await requireAdmin({ request, cookie });
    await markPaidOrder(db(), params.id!);
    return { success: true };
  });

export default orders;

import { Schema } from 'effect';
import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup } from 'effect/unstable/httpapi';

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
} from '../lib/orders';
import { requireAdmin, requireAuth } from '../lib/auth';
import { bindBody } from '../lib/validate';
import { paging } from '../lib/util';

const IdParams = Schema.Struct({ id: Schema.String });

const OrderItemDto = Schema.Struct({
  id: Schema.String,
  productId: Schema.NullOr(Schema.String),
  productSlug: Schema.String,
  productName: Schema.String,
  size: Schema.NullOr(Schema.String),
  price: Schema.Number,
  quantity: Schema.Number,
  subtotal: Schema.Number,
});

const OrderDto = Schema.Struct({
  id: Schema.String,
  code: Schema.String,
  status: Schema.String,
  paymentStatus: Schema.String,
  totalAmount: Schema.Number,
  shippingFee: Schema.Number,
  discountValue: Schema.Number,
  shippingAddress: Schema.Struct({
    fullName: Schema.String,
    phone: Schema.String,
    addressLine1: Schema.String,
    addressLine2: Schema.NullOr(Schema.String),
    city: Schema.String,
    district: Schema.String,
    ward: Schema.String,
    postalCode: Schema.String,
  }),
  items: Schema.Array(OrderItemDto),
  createdAt: Schema.NullOr(Schema.String),
  updatedAt: Schema.NullOr(Schema.String),
});

const OrderListDto = Schema.Struct({
  orders: Schema.Array(OrderDto),
  total: Schema.Number,
});

const SuccessDto = Schema.Struct({ success: Schema.Boolean });

export const ordersGroup = HttpApiGroup.make('orders').add(
  HttpApiEndpoint.post('createOrder', '/v1/orders', { success: OrderDto }),
  HttpApiEndpoint.get('listOrders', '/v1/orders', { success: OrderListDto }),
  HttpApiEndpoint.get('getOrder', '/v1/orders/:id', { success: OrderDto, params: IdParams }),
  HttpApiEndpoint.patch('cancelOrder', '/v1/orders/:id/cancel', {
    success: OrderDto,
    params: IdParams,
  }),
  HttpApiEndpoint.get('listAllOrders', '/v1/admin/orders/all', { success: OrderListDto }),
  HttpApiEndpoint.get('adminGetOrder', '/v1/admin/orders/:id', {
    success: OrderDto,
    params: IdParams,
  }),
  HttpApiEndpoint.patch('adminUpdateStatus', '/v1/admin/orders/:id/status', {
    success: OrderDto,
    params: IdParams,
  }),
  HttpApiEndpoint.post('adminMarkPaid', '/v1/admin/orders/:id/mark-paid', {
    success: SuccessDto,
    params: IdParams,
  }),
);

export const ordersLocal = HttpApi.make('api-effect').add(ordersGroup);

export const ordersHandlers = HttpApiBuilder.group(ordersLocal, 'orders', (h) =>
  h
    .handle(
      'createOrder',
      wrap(true, async (ctx) => {
        const auth = await requireAuth(ctx);
        const in1 = bindBody(await bodyOf(ctx), {
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
        ctx.setStatus(201);
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
        return getOrder(ctx.db, ctx.param('id'), auth.user.id, auth.user.role);
      }),
    )
    .handle(
      'cancelOrder',
      wrap(true, async (ctx) => {
        const auth = await requireAuth(ctx);
        return cancelOrder(ctx.db, ctx.param('id'), auth.user.id);
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
        return getOrder(ctx.db, ctx.param('id'), '', 'ADMIN');
      }),
    )
    .handle(
      'adminUpdateStatus',
      wrap(true, async (ctx) => {
        await requireAdmin(ctx);
        const in1 = bindBody(await bodyOf(ctx), {
          status: { type: 'string', required: true },
        });
        return adminUpdateStatus(ctx.db, ctx.param('id'), in1.status);
      }),
    )
    .handle(
      'adminMarkPaid',
      wrap(true, async (ctx) => {
        await requireAdmin(ctx);
        await markPaidOrder(ctx.db, ctx.param('id'));
        return { success: true };
      }),
    ),
);

import { HttpApi } from 'effect/unstable/httpapi';

// Per-group endpoint declarations live beside their handlers (routes/*.ts).
// Each route file also exports a single-group HttpApi copy for its builder;
// HttpApi service keys are apiId/groupId strings, so handlers bound to the
// local copies hit the same groups this aggregate declares.
import { coreGroup } from './routes/core';
import { blogGroup } from './routes/blog';
import { productsGroup } from './routes/products';
import { cartGroup } from './routes/cart';
import { ordersGroup } from './routes/orders';
import { paymentsGroup } from './routes/payments';
import { reviewsGroup } from './routes/reviews';
import { usersGroup } from './routes/users';
import { authGroup } from './routes/auth';
import { eventsGroup } from './routes/events';

export const api = HttpApi.make('api-effect').add(
  coreGroup,
  blogGroup,
  productsGroup,
  cartGroup,
  ordersGroup,
  paymentsGroup,
  reviewsGroup,
  usersGroup,
  authGroup,
  eventsGroup,
);

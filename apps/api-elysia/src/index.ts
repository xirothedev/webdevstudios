import CORS from '@elysiajs/cors';
import { Elysia } from 'elysia';

import { ApiError, nestBody } from './lib/errors';
import { csrfGuard, generateCsrfToken, issueCsrfToken } from './lib/csrf';
import { getThrottler } from './lib/throttle';
import { db } from './lib/prisma';
import { sweepExpiredOrders as sweep } from './lib/orders';
import products from './routes/products';
import cart from './routes/cart';
import orders from './routes/orders';
import payments from './routes/payments';
import reviews from './routes/reviews';
import users from './routes/users';
import auth from './routes/auth';
import events from './routes/events';
import blog from './routes/blog';

// Go main.go: strictThrottle (10/min) on auth + payment-critical paths,
// defaultThrottle (100/min) on the rest. Keyed by route pattern = c.FullPath().
const STRICT_PATHS = new Set([
  '/v1/auth/register',
  '/v1/auth/login',
  '/v1/auth/2fa/enable',
  '/v1/auth/2fa/verify',
  '/v1/auth/password/reset-request',
  '/v1/auth/password/reset',
  '/v1/payments/create-link',
  '/v1/payments/verify/:transactionCode',
]);

export const app = new Elysia({ prefix: '/v1' })
  .use(CORS({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000', credentials: true }))
  .onBeforeHandle(async ({ request, path, route, cookie }) => {
    csrfGuard({ request, path, cookie });
    // ponytail: OPTIONS preflights are unauthed browser noise; counting them would
    // burn strict-path quota (10/min) on every cross-origin state-changing POST.
    if (request.method !== 'OPTIONS') {
      const throttler = await getThrottler();
      if (throttler !== null) {
        const key = route ?? path;
        const limit = STRICT_PATHS.has(key) ? 10 : 100;
        await throttler(limit)({ path: key, request });
      }
    }
  })
  .get('/ping', () => ({ message: 'pong from elysia' }))
  .get('/csrf-token', ({ cookie }) => {
    const token = generateCsrfToken();
    issueCsrfToken(cookie, token);
    return { csrfToken: token };
  })
  // ponytail: onError must register before .use() to catch composed-instance errors.
  .onError((ctx) => {
    const { code, error, set, request, path } = ctx;
    if (error instanceof ApiError) {
      set.status = error.status;
      return nestBody(error.status, error.messageValue);
    }
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return nestBody(404, `Cannot ${request.method} ${path}`);
    }
    const message = error instanceof Error ? error.message : String(error);
    console.error('[error]', request.method, path, message);
    set.status = 500;
    return nestBody(500, message);
  })
  .use(products)
  .use(cart)
  .use(orders)
  .use(payments)
  .use(reviews)
  .use(users)
  .use(auth)
  .use(events)
  .use(blog);

// ponytail: 4002 avoids 4000 (NestJS) and 4001 (Go) while all twins run locally.
if (import.meta.main) {
  const port = Number(process.env.PORT ?? 4002);
  void (async () => {
    await sweep(db()).catch((e: unknown) => {
      console.error('sweep failed:', e instanceof Error ? e.message : String(e));
    });
    setInterval(
      () => {
        void sweep(db()).catch((e: unknown) => {
          console.error('sweep failed:', e instanceof Error ? e.message : String(e));
        });
      },
      5 * 60 * 1000,
    );
    app.listen(port);
    console.warn(`api-elysia listening on http://localhost:${port}/v1`);
  })();
}

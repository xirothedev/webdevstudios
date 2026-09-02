import { Config, Effect, Layer } from 'effect';
import * as BunHttpServer from '@effect/platform-bun/BunHttpServer';
import { HttpMiddleware, HttpRouter } from 'effect/unstable/http';

import { nestBody } from './lib/errors';
import { generateCsrfToken, issueCsrfToken } from './lib/csrf';
import { route } from './lib/http';
import { db } from './lib/prisma';
import { sweepExpiredOrders as sweep } from './lib/orders';
import { blogRoutes } from './routes/blog';
import { productsRoutes } from './routes/products';
import { cartRoutes } from './routes/cart';
import { ordersRoutes } from './routes/orders';
import { paymentsRoutes } from './routes/payments';
import { reviewsRoutes } from './routes/reviews';
import { usersRoutes } from './routes/users';
import { authRoutes } from './routes/auth';
import { eventsRoutes } from './routes/events';

const ping = route('GET', '/ping', async () => ({ message: 'pong from effect' }));

const csrfToken = route('GET', '/csrf-token', async (ctx) => {
  const token = generateCsrfToken();
  issueCsrfToken(ctx, token);
  return { csrfToken: token };
});

// ponytail: wildcard catch-alls beat fighting the router's 404 — serve's
// middleware cannot rewrite the response (documented), so we own the 404 route.
// Guarded like Elysia's NOT_FOUND: no CSRF check, no throttle quota.
// OPTIONS excluded: the CORS middleware answers all OPTIONS before routing (as in Elysia).
const notFoundRoutes = (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const).map(
  (method) =>
    route(
      method,
      '/*',
      async (ctx) => {
        ctx.status = 404;
        return nestBody(
          404,
          `Cannot ${method} ${new URL(ctx.request.url, 'http://localhost').pathname}`,
        );
      },
      false,
    ),
);

// @elysiajs/cors accepted a single origin, a comma-list, or '*'. The predicate
// mirrors that, and echoes the requesting origin (credentials-safe).
function originAllowed(allowList: string, origin: string): boolean {
  return allowList === '*' || allowList.split(',').some((o) => o.trim() === origin);
}

export function appLayer(corsOrigin: string) {
  return Layer.mergeAll(
    ping,
    csrfToken,
    ...blogRoutes,
    ...productsRoutes,
    ...cartRoutes,
    ...ordersRoutes,
    ...paymentsRoutes,
    ...reviewsRoutes,
    ...usersRoutes,
    ...authRoutes,
    ...eventsRoutes,
    ...notFoundRoutes,
    HttpRouter.middleware(
      HttpMiddleware.cors({
        allowedOrigins: (o) => originAllowed(corsOrigin, o),
        credentials: true,
      }),
      { global: true },
    ),
  );
}

const program = Effect.gen(function* () {
  const port = yield* Config.int('PORT').pipe(Config.withDefault(4003));
  const corsOrigin = yield* Config.string('CORS_ORIGIN').pipe(
    Config.withDefault('http://localhost:3000'),
  );

  const served = Layer.provide(
    HttpRouter.serve(appLayer(corsOrigin)),
    BunHttpServer.layer({ port }),
  );

  yield* Effect.tryPromise(() => sweep(db())).pipe(
    Effect.catchDefect((e) => Effect.sync(() => console.error('sweep failed:', e))),
  );
  yield* Effect.sync(() => {
    setInterval(
      () => {
        sweep(db()).catch((e: unknown) =>
          console.error('sweep failed:', e instanceof Error ? e.message : String(e)),
        );
      },
      5 * 60 * 1000,
    );
  });

  // Effect.never holds the scope open; without it the server layer is disposed
  // the moment the layer build resolves.
  yield* Effect.scoped(Effect.ignore(Layer.build(served)).pipe(Effect.andThen(Effect.never)));
});

if (import.meta.main) {
  Effect.runPromise(program).catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  });
}

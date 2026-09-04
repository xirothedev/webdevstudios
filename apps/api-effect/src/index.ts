import { Config, Effect, Layer, Schedule } from 'effect';
import * as BunHttpServer from '@effect/platform-bun/BunHttpServer';
import { HttpMiddleware, HttpRouter } from 'effect/unstable/http';
import { HttpApiBuilder, HttpApiSwagger } from 'effect/unstable/httpapi';

import { api } from './api';
import { coreHandlers } from './routes/core';
import { blogHandlers } from './routes/blog';
import { productsHandlers } from './routes/products';
import { cartHandlers } from './routes/cart';
import { ordersHandlers } from './routes/orders';
import { paymentsHandlers } from './routes/payments';
import { reviewsHandlers } from './routes/reviews';
import { usersHandlers } from './routes/users';
import { authHandlers } from './routes/auth';
import { eventsHandlers } from './routes/events';
import { Db, DbLive } from './lib/prisma';

import { wildcard404 } from './lib/http';
import { sweepExpiredOrders as sweep } from './lib/orders';

// @elysiajs/cors accepted a single origin, a comma-list, or '*'. The predicate
// mirrors that, and echoes the requesting origin (credentials-safe).
function originAllowed(allowList: string, origin: string): boolean {
  return allowList === '*' || allowList.split(',').some((o) => o.trim() === origin);
}

export function appLayer() {
  // Db is consumed by the endpoint handlers and the sweep daemon; the group
  // handler layers satisfy HttpApiBuilder.layer's group-service requirements.
  const groups = Layer.provide(
    Layer.mergeAll(
      coreHandlers,
      blogHandlers,
      productsHandlers,
      cartHandlers,
      ordersHandlers,
      paymentsHandlers,
      reviewsHandlers,
      usersHandlers,
      authHandlers,
      eventsHandlers,
      SweepDaemon,
    ),
    DbLive,
  );
  const appWithDb = HttpRouter.provideRequest(DbLive)(
    Layer.mergeAll(
      Layer.provideMerge(HttpApiBuilder.layer(api), groups),
      wildcard404('GET'),
      wildcard404('POST'),
      wildcard404('PUT'),
      wildcard404('PATCH'),
      wildcard404('DELETE'),
    ),
  );
  // Swagger outside the provideRequest wrapper: plain HttpRouter registration.
  return Layer.mergeAll(appWithDb, HttpApiSwagger.layer(api, { path: '/docs' }));
}

// CORS as a chain middleware (answers preflights with 204 before routing).
export function corsMiddleware(corsOrigin: string) {
  return HttpMiddleware.cors({
    allowedOrigins: (o) => originAllowed(corsOrigin, o),
    credentials: true,
  });
}

// Sweep expired orders: once at boot, then every 5 minutes. Lives in the app
// layer so it shares the Db scope and dies with the server.
const SweepDaemon = Layer.effectDiscard(
  Effect.gen(function* () {
    const db = (yield* Db).client;
    yield* Effect.tryPromise({
      try: () => sweep(db),
      catch: (e): Error => (e instanceof Error ? e : new Error(String(e))),
    }).pipe(
      Effect.catchIf(
        (_e): _e is Error => true,
        (e) => Effect.logError(`sweep failed: ${e.message}`),
      ),
      Effect.schedule(Schedule.spaced('5 minutes')),
      Effect.forkScoped,
    );
  }),
);

const program = Effect.gen(function* () {
  // Fail fast on required secrets before the server accepts traffic.
  yield* Effect.all([Config.redacted('DATABASE_URL'), Config.redacted('JWT_SECRET_KEY')], {
    concurrency: 'unbounded',
  });
  const port = yield* Config.int('PORT').pipe(Config.withDefault(4003));
  const corsOrigin = yield* Config.string('CORS_ORIGIN').pipe(
    Config.withDefault('http://localhost:3000'),
  );

  const served = Layer.provide(
    HttpRouter.serve(appLayer(), { middleware: corsMiddleware(corsOrigin) }),
    BunHttpServer.layer({ port }),
  );

  // ponytail: HttpApi rc wraps handler requirements in router Request markers
  // the compiler can't prove closed here; runtime resolves them from the router
  // context. Cast only this boundary.
  // Effect.never holds the scope open; without it the server layer is disposed
  // the moment the layer build resolves.
  const run = Effect.scoped(Effect.ignore(Layer.build(served)).pipe(Effect.andThen(Effect.never)));
  yield* run as unknown as Effect.Effect<void, unknown, never>;
});

if (import.meta.main) {
  Effect.runPromise(program).catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  });
}

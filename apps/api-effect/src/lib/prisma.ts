import { Config, Context, Effect, Layer } from 'effect';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

// Prisma 7's constructor returns a narrower type than the default
// PrismaClient generic; ReturnType keeps the exact instantiated type.
export type DatabaseClient = ReturnType<typeof createClient>;

function createClient(connectionString: string) {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: ['query', 'warn', 'error'],
  });
}

export class Db extends Context.Service<Db, { readonly client: DatabaseClient }>()('api/Db') {}

// Layer-effect runs in the layer's scope: the client disconnects when the
// application layer is released.
export const DbLive = Layer.effect(
  Db,
  Effect.gen(function* () {
    const connectionString = yield* Config.string('DATABASE_URL');
    const client = yield* Effect.acquireRelease(
      Effect.sync(() => createClient(connectionString)),
      (c) => Effect.tryPromise(() => c.$disconnect()).pipe(Effect.ignore),
    );
    return { client };
  }),
);

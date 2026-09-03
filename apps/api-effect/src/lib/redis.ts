import { Effect, ManagedRuntime } from 'effect';
import type { RedisClient as BunClient } from 'bun';
import * as BunRedis from '@effect/platform-bun/BunRedis';

// ioredis-shaped surface for the ported blueprint call sites (throttle + auth-logic).
export type RedisClient = {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<unknown>;
  set(key: string, value: string, mode: 'EX', ttlSeconds: number): Promise<unknown>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<number>;
};

let ready: Promise<RedisClient | null> | null = null;

export function getRedis(): Promise<RedisClient | null> {
  if (ready === null) {
    ready = initRedis();
  }

  return ready;
}

// BunRedis is an Effect service; ManagedRuntime owns the connection for the
// process lifetime — same lifecycle the ioredis singleton had.
async function initRedis(): Promise<RedisClient | null> {
  const url = `redis://${process.env.REDIS_HOST ?? 'localhost'}:${Number(process.env.REDIS_PORT ?? 6379)}`;
  const runtime = ManagedRuntime.make(BunRedis.layer({ url }));

  const cmd = <T>(f: (client: BunClient) => Promise<T>): Promise<T> =>
    runtime.runPromise(
      Effect.gen(function* () {
        const redis = yield* BunRedis.BunRedis;
        return yield* redis.use(f);
      }),
    );

  try {
    // Blueprint parity: 2s availability check, then degrade to `null` (off).
    await runtime.runPromise(
      Effect.gen(function* () {
        const redis = yield* BunRedis.BunRedis;
        return yield* redis.use((client) => client.ping());
      }).pipe(Effect.timeout('2 seconds')),
    );
    return {
      incr: (key) => cmd((c) => c.incr(key)),
      expire: (key, seconds) => cmd((c) => c.expire(key, seconds)),
      // Bun's RedisClient takes the same (key, value, mode, seconds) as ioredis.
      set: (key, value, mode, ttlSeconds) => cmd((c) => c.set(key, value, mode, ttlSeconds)),
      get: (key) => cmd((c) => c.get(key)),
      del: (key) => cmd((c) => c.del(key)),
    };
  } catch {
    // Blueprint parity: unreachable redis -> off. The timed-out ping interrupts
    // the layer acquisition, and BunRedis's own finalizer closes the client.
    return null;
  }
}

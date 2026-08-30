import { ApiError } from './errors';
import { getRedis } from './redis';

// Fixed-window counter per key, mirrors api-go throttle.go.
// ponytail: global fixed window per path+ip, not a per-route config tree.
// key uses the route pattern (Go c.FullPath()), not the concrete path.

type Throttleable = {
  path: string;
  request: Request;
};

export type Throttler = (limit: number) => (ctx: Throttleable) => Promise<void>;

let ready: Promise<Throttler | null> | null = null;

export function getThrottler(): Promise<Throttler | null> {
  if (ready === null) {
    ready = initThrottler();
  }

  return ready;
}

async function initThrottler(): Promise<Throttler | null> {
  const redis = await getRedis();

  if (redis === null) {
    return null;
  }

  return (limit: number) => async (ctx: Throttleable) => {
    const key = `throttle:${ctx.path}:${clientIp(ctx.request)}:${Math.floor(Date.now() / 60000)}`;
    const n = await redis.incr(key);
    if (n === 1) {
      await redis.expire(key, 60);
    }
    if (n > limit) {
      throw new ApiError(429, 'ThrottlerException: Too Many Requests');
    }
  };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded !== null && forwarded !== '') {
    return forwarded.split(',')[0]!.trim();
  }

  return 'unknown';
}

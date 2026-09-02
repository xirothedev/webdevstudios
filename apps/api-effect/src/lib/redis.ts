import Redis from 'ioredis';

export type RedisClient = Redis;

let ready: Promise<Redis | null> | null = null;

export function getRedis(): Promise<Redis | null> {
  if (ready === null) {
    ready = initRedis();
  }

  return ready;
}

async function initRedis(): Promise<Redis | null> {
  const client = new Redis({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  });

  client.on('error', (error: Error) => {
    console.error(`redis: ${error.message}`);
  });

  try {
    await race(client.ping(), 2000);
    return client;
  } catch {
    client.disconnect();

    return null;
  }
}

async function race<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

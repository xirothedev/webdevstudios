import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

// ponytail: Prisma 7's constructor returns a narrower type than the default
// PrismaClient generic; ReturnType keeps the exact instantiated type.
function createClient() {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' }),
    log: ['query', 'warn', 'error'],
  });
}

type DatabaseClient = ReturnType<typeof createClient>;

let client: DatabaseClient | null = null;

export function db(): DatabaseClient {
  if (client === null) {
    client = createClient();
  }

  return client;
}

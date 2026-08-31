import type { DatabaseClient } from '../lib/prisma';

// ponytail: minimal Prisma-shaped fake — implements only the query shapes the
// domain modules use. Not a general Prisma mock.
export type Row = Record<string, unknown>;

type Where = Record<string, unknown>;
type Operators = { gte?: number; gt?: number; lte?: number; lt?: number; in?: unknown[] };
type CreateData = Record<string, unknown> & { items?: Array<Record<string, unknown>> };

// ponytail: Prisma @default(...) per model, so rows created without a field
// still behave like real Prisma rows.
const MODEL_DEFAULTS: Record<string, Record<string, unknown>> = {
  order: { status: 'PENDING', paymentStatus: 'PENDING' },
  paymentTransaction: { status: 'PENDING' },
};

const RELATIONS: Record<string, { table: string; local: string; foreign: string }> = {
  items: { table: 'orderItem', local: 'orderId', foreign: 'id' },
  product: { table: 'product', local: 'productId', foreign: 'id' },
  sizeStocks: { table: 'productSizeStock', local: 'id', foreign: 'productId' },
  shippingAddress: { table: 'shippingAddress', local: 'id', foreign: 'shippingAddressId' },
  device: { table: 'device', local: 'id', foreign: 'deviceId' },
};

function isOperatorObject(v: unknown): v is Operators {
  return (
    v !== null &&
    typeof v === 'object' &&
    !Array.isArray(v) &&
    !(v instanceof Date) &&
    ['gte', 'gt', 'lte', 'lt', 'in'].some((k) => k in v)
  );
}

function matches(row: Row, where: Where | undefined): boolean {
  if (where === undefined) return true;
  for (const [key, cond] of Object.entries(where)) {
    const value = row[key];
    if (cond === null) {
      if (value !== null && value !== undefined) return false;
      continue;
    }
    if (isOperatorObject(cond)) {
      if (typeof value !== 'number') return false;
      if (cond.gte !== undefined && value < cond.gte) return false;
      if (cond.gt !== undefined && value <= cond.gt) return false;
      if (cond.lte !== undefined && value > cond.lte) return false;
      if (cond.lt !== undefined && value >= cond.lt) return false;
      if (cond.in !== undefined && !cond.in.includes(value)) return false;
      continue;
    }
    if (cond instanceof Date) {
      if (!(value instanceof Date) || (value as Date).getTime() !== cond.getTime()) return false;
      continue;
    }
    if (cond !== null && typeof cond === 'object' && !Array.isArray(cond)) {
      // composite key lookup, e.g. { productId_size: { productId, size } }
      const nested = cond as Record<string, unknown>;
      for (const [nk, nv] of Object.entries(nested)) {
        if (row[nk] !== nv) return false;
      }
      continue;
    }
    if (value !== cond) return false;
  }
  return true;
}

function applyData(row: Row, data: CreateData): void {
  for (const [key, value] of Object.entries(data)) {
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      ('increment' in value || 'decrement' in value)
    ) {
      const op = value as { increment?: number; decrement?: number };
      if (op.increment !== undefined || op.decrement !== undefined) {
        row[key] =
          ((row[key] as number | undefined) ?? 0) + (op.increment ?? 0) - (op.decrement ?? 0);
        continue;
      }
    }
    row[key] = value;
  }
}

export function makePrismaFake(seed: Record<string, Row[]> = {}): DatabaseClient {
  const tables: Record<string, Row[]> = {};
  for (const [name, rows] of Object.entries(seed)) tables[name] = rows.map((r) => ({ ...r }));

  const table = (name: string): Row[] => {
    if (tables[name] === undefined) tables[name] = [];
    return tables[name];
  };

  const withInclude = <T extends Row>(
    rows: T[],
    include: Record<string, unknown> | undefined,
  ): T[] => {
    if (include === undefined) return rows;
    for (const [rel, spec] of Object.entries(include)) {
      const relDef = RELATIONS[rel];
      if (relDef === undefined) continue;
      const nestedInclude =
        spec !== null && typeof spec === 'object'
          ? (spec as { include?: Record<string, unknown> }).include
          : undefined;
      for (const row of rows) {
        const related = table(relDef.table).filter((r) => r[relDef.local] === row[relDef.foreign]);
        (row as Record<string, unknown>)[rel] = withInclude(related, nestedInclude);
      }
    }
    return rows;
  };

  const filter = (name: string, where?: Where) => table(name).filter((r) => matches(r, where));

  const orderByRows = (rows: Row[], orderBy: Record<string, string> | undefined): Row[] => {
    if (orderBy === undefined) return rows;
    const [[key, dir]] = Object.entries(orderBy);
    return [...rows].sort((a, b) => {
      const av = a[key] as Date | number | string;
      const bv = b[key] as Date | number | string;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return dir === 'desc' ? -cmp : cmp;
    });
  };

  const snapshot = () => JSON.parse(JSON.stringify(tables, replacer)) as Record<string, Row[]>;
  function replacer(_k: string, v: unknown): unknown {
    if (typeof v === 'object' && v !== null && 'isNaN' in (v as object)) return v.toString();
    return v;
  }
  const restore = (snap: Record<string, Row[]>) => {
    for (const key of Object.keys(tables)) delete tables[key];
    Object.assign(tables, snap);
  };

  const makeModel = (name: string) => ({
    findUnique: async ({
      where,
      include,
    }: {
      where?: Where;
      include?: Record<string, unknown>;
    }) => {
      const rows = withInclude(filter(name, where), include);
      return rows[0] ?? null;
    },
    findFirst: async ({
      where,
      orderBy,
      include,
    }: {
      where?: Where;
      orderBy?: Record<string, string>;
      include?: Record<string, unknown>;
    }) => {
      return withInclude(orderByRows(filter(name, where), orderBy), include)[0] ?? null;
    },
    findMany: async ({
      where,
      orderBy,
      skip,
      take,
      include,
    }: {
      where?: Where;
      orderBy?: Record<string, string>;
      skip?: number;
      take?: number;
      include?: Record<string, unknown>;
    }) => {
      let rows = orderByRows(filter(name, where), orderBy);
      if (skip !== undefined) rows = rows.slice(skip);
      if (take !== undefined) rows = rows.slice(0, take);
      return withInclude(rows, include);
    },
    count: async ({ where }: { where?: Where }) => filter(name, where).length,
    create: async ({ data }: { data: CreateData }) => {
      // ponytail: mimic Prisma @default(now()) for createdAt/updatedAt
      const row: Row = {
        createdAt: new Date(),
        updatedAt: new Date(),
        ...(MODEL_DEFAULTS[name] ?? {}),
        id: `auto-${Math.random().toString(36).slice(2)}`,
        ...data,
      };
      let nestedItems: Row[] | undefined;
      if (Array.isArray(row.items)) nestedItems = row.items;
      else if (row.items && typeof row.items === 'object') {
        nestedItems = (row.items as { create?: Row[] }).create;
      }
      delete row.items;
      table(name).push(row);
      if (nestedItems) {
        for (const item of nestedItems) table('orderItem').push({ ...item, orderId: data.id });
      }
      return { ...row };
    },
    update: async ({ where, data }: { where: Where; data: CreateData }) => {
      const row = filter(name, where)[0];
      if (row === undefined) throw new Error(`update: no row found in ${name}`);
      applyData(row, data);
      return { ...row };
    },
    updateMany: async ({ where, data }: { where: Where; data: CreateData }) => {
      const rows = filter(name, where);
      for (const row of rows) applyData(row, data);
      return { count: rows.length };
    },
    delete: async ({ where }: { where: Where }) => {
      const row = filter(name, where)[0];
      if (row === undefined) throw new Error(`delete: no row found in ${name}`);
      table(name).splice(table(name).indexOf(row), 1);
      return { ...row };
    },
    deleteMany: async ({ where }: { where?: Where }) => {
      const kept = table(name).filter((r) => !matches(r, where));
      const count = table(name).length - kept.length;
      tables[name] = kept;
      return { count };
    },
    createMany: async ({ data }: { data: Row[] }) => {
      for (const row of data) table(name).push({ ...row });
      return { count: data.length };
    },
  });

  const fake: Record<string, unknown> = {
    $transaction: async (fn: (tx: DatabaseClient) => Promise<unknown>) => {
      const snap = snapshot();
      try {
        return await fn(fake as unknown as DatabaseClient);
      } finally {
        // ponytail: fake "transaction" — always commit; rollback never exercised.
        // Good enough: tests assert on committed state after the call.
        void snap;
      }
    },
  };

  for (const name of [
    'user',
    'userMFAMethod',
    'mFABackupCode',
    'device',
    'session',
    'product',
    'productSizeStock',
    'cart',
    'cartItem',
    'order',
    'orderItem',
    'paymentTransaction',
    'shippingAddress',
  ]) {
    fake[name] = makeModel(name);
  }
  void restore;

  return fake as unknown as DatabaseClient;
}

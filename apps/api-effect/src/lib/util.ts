import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';

export function newId(): string {
  return randomBytes(12).toString('hex');
}

export function newUuid(): string {
  return randomUUID();
}

export function randomHex(byteLength: number): string {
  return randomBytes(byteLength).toString('hex');
}

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return timingSafeEqual(bufferA, bufferB);
}

export function goTime(value: Date | null): string | null {
  if (value === null) {
    return null;
  }

  const base = value.toISOString().slice(0, 19);
  const milliseconds = value.getMilliseconds();

  if (milliseconds === 0) {
    return `${base}Z`;
  }

  const fraction = String(milliseconds).padStart(3, '0').replace(/0+$/, '');

  return `${base}.${fraction}Z`;
}

export function parseIntDef(value: string | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }

  const trimmed = value.trim();

  if (!/^[+-]?\d+$/.test(trimmed)) {
    return fallback;
  }

  const parsed = Number(trimmed);

  return Number.isSafeInteger(parsed) ? parsed : fallback;
}

export function paging(
  page: string | undefined,
  limit: string | undefined,
  maxLimit = 100,
): { page: number; limit: number } {
  const parsedPage = parseIntDef(page, 1);
  const parsedLimit = parseIntDef(limit, 10);

  return {
    page: parsedPage >= 1 ? parsedPage : 1,
    limit: parsedLimit >= 1 && parsedLimit <= maxLimit ? parsedLimit : 10,
  };
}

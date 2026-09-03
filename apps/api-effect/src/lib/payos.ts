import { createHmac } from 'node:crypto';
import { Effect } from 'effect';
import { FetchHttpClient, HttpClient, HttpClientRequest } from 'effect/unstable/http';

import { safeEqual } from './util';

// PayOS REST client, mirrors api-go payments/payos.go.
// Ponytail: no official PayOS SDK, so call api-merchant.payos.vn directly.

export type PaymentItem = { name: string; quantity: number; price: number };

export class PayosNotConfiguredError extends Error {
  constructor() {
    super('payments: PAYOS_* env vars not configured');
    this.name = 'PayosNotConfiguredError';
  }
}

let cfg: { clientId: string; apiKey: string; checksumKey: string } | null | undefined;

function getConfig() {
  if (cfg === undefined) {
    cfg = {
      clientId: process.env.PAYOS_CLIENT_ID ?? '',
      apiKey: process.env.PAYOS_API_KEY ?? '',
      checksumKey: process.env.PAYOS_CHECKSUM_KEY ?? '',
    };
  }

  return cfg;
}

export function payosEnabled(): boolean {
  const c = getConfig();
  return c !== null && c.clientId !== '';
}

export type CreateLinkResult = {
  checkoutUrl: string;
  paymentLinkId: string;
  raw: Record<string, unknown>;
};

// Mirrors payOS.paymentRequests.create.
export async function createPaymentLink(
  orderCodeNum: number,
  amount: number,
  description: string,
  returnUrl: string,
  cancelUrl: string,
  items: PaymentItem[],
): Promise<CreateLinkResult> {
  const c = getConfig();
  if (c === null || c.clientId === '') throw new PayosNotConfiguredError();

  const payload = {
    orderCode: orderCodeNum,
    amount: Math.trunc(amount),
    description,
    returnUrl,
    cancelUrl,
    items,
  };
  // Platform HttpClient instead of raw fetch; FetchHttpClient.layer is scoped.
  const out = (await Effect.runPromise(
    Effect.gen(function* () {
      const http = yield* HttpClient.HttpClient;
      const request = yield* HttpClientRequest.post('https://api-merchant.payos.vn/v2/payment-requests').pipe(
        HttpClientRequest.setHeader('content-type', 'application/json'),
        HttpClientRequest.setHeader('x-client-id', c.clientId),
        HttpClientRequest.setHeader('x-api-key', c.apiKey),
        HttpClientRequest.bodyJson(payload),
      );
      const res = yield* http.execute(request);
      return yield* res.json;
    }).pipe(
      Effect.scoped,
      Effect.provide(FetchHttpClient.layer),
      Effect.mapError((e) => new Error(`payos: ${String(e)}`)),
    ),
  )) as { code?: string; desc?: string; data?: unknown };
  if (out.code !== '00') {
    throw new Error(`payos: ${out.code} ${out.desc ?? ''}`.trimEnd());
  }

  const data = out.data as
    | { checkoutUrl?: string; paymentLinkId?: string; orderCode?: number }
    | undefined;
  let code = data?.paymentLinkId ?? '';
  if (code === '') {
    code = String(data?.orderCode ?? '');
  }
  return {
    checkoutUrl: data?.checkoutUrl ?? '',
    paymentLinkId: code,
    raw: (out.data as Record<string, unknown>) ?? {},
  };
}

// Sorts data keys alphabetically and joins key=value pairs.
export function buildCanonicalString(data: Record<string, unknown>): string {
  return Object.keys(data)
    .sort()
    .map((k) => `${k}=${jsonValueString(data[k])}`)
    .join('&');
}

export function verifyWebhookSignature(envelope: Record<string, unknown>): boolean {
  const c = getConfig();
  if (c === null || c.checksumKey === '') return false;
  const sig = typeof envelope.signature === 'string' ? envelope.signature : '';
  const data = envelope.data;
  if (sig === '' || typeof data !== 'object' || data === null || Array.isArray(data)) return false;

  const expected = createHmac('sha256', c.checksumKey)
    .update(buildCanonicalString(data as Record<string, unknown>))
    .digest('hex');
  return safeEqual(expected, sig);
}

function jsonValueString(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return JSON.stringify(v) ?? 'null';
}

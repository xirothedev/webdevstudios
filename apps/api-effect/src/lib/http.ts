import { Duration, Effect } from 'effect';
import {
  type Cookies,
  HttpRouter,
  HttpServerRequest,
  HttpServerResponse,
} from 'effect/unstable/http';

import { ApiError, nestBody } from './errors';
import { csrfGuard } from './csrf';
import { getThrottler } from './throttle';
import { Db, type DatabaseClient } from './prisma';
import { readJsonObject } from './validate';

export type CookieOptions = {
  httpOnly?: boolean;
  path?: string;
  sameSite?: 'strict' | 'lax' | 'none';
  // Seconds; converted to Duration at render (cookie libs read bare numbers as millis).
  maxAge?: number;
  secure?: boolean;
};

export type Ctx = {
  // Web Request behind the Bun adapter: method, headers, body.
  http: Request;
  request: HttpServerRequest.HttpServerRequest;
  // Endpoint path as declared in the HttpApi (e.g. /v1/blog/posts/:slug).
  path: string;
  params: Record<string, string | undefined>;
  query: Record<string, string | undefined>;
  cookies: Record<string, string>;
  db: DatabaseClient;
  status: number;
  setCookie(name: string, value: string, options?: CookieOptions): void;
};

// Go main.go: strictThrottle (10/min) on auth + payment-critical paths,
// defaultThrottle (100/min) on the rest.
const STRICT_PATHS = new Set([
  '/v1/auth/register',
  '/v1/auth/login',
  '/v1/auth/2fa/enable',
  '/v1/auth/2fa/verify',
  '/v1/auth/password/reset-request',
  '/v1/auth/password/reset',
  '/v1/payments/create-link',
  '/v1/payments/verify/:transactionCode',
]);

export const PREFIX = '/v1';

function apiErrorBody(e: ApiError): HttpServerResponse.HttpServerResponse {
  return HttpServerResponse.jsonUnsafe(nestBody(e.status, e.messageValue), { status: e.status });
}

function renderCookies(
  res: HttpServerResponse.HttpServerResponse,
  setCookies: readonly { name: string; value: string; options?: CookieOptions }[],
): HttpServerResponse.HttpServerResponse {
  for (const c of setCookies) {
    const maxAge =
      typeof c.options?.maxAge === 'number'
        ? Duration.seconds(c.options.maxAge)
        : c.options?.maxAge;
    const options: Cookies.Cookie['options'] = {
      ...c.options,
      ...(maxAge !== undefined ? { maxAge } : {}),
    };
    res = HttpServerResponse.setCookiesUnsafe(res, [[c.name, c.value, options]]);
  }
  return res;
}

type HandlerCtx = {
  readonly request: HttpServerRequest.HttpServerRequest;
  // Path params from the matched route; the per-endpoint Schema.Struct typing
  // is looser at this seam, and every declared param in this app is a string.
  readonly params?: Record<string, unknown>;
  readonly endpoint: { readonly path: string };
};

// The seam between the Promise-based mirror code and the Effect boundary:
// ApiError becomes a Nest-shaped response; anything else dies and is logged +
// 500'd by errorBody. Guards run on the declared endpoint path (same key
// Elysia used: route pattern, not concrete path).
export function wrap(
  guarded: boolean,
  fn: (ctx: Ctx) => Promise<unknown>,
): (ctx: HandlerCtx) => Effect.Effect<HttpServerResponse.HttpServerResponse, never, Db> {
  return (handlerCtx) =>
    Effect.gen(function* () {
      const request = handlerCtx.request;
      const web = yield* HttpServerRequest.toWeb(request).pipe(Effect.orDie);
      const db = (yield* Db).client;
      const pattern = handlerCtx.endpoint.path;
      const url = new URL(request.url, 'http://localhost');
      const setCookies: { name: string; value: string; options?: CookieOptions }[] = [];
      const ctx: Ctx = {
        http: web,
        request,
        path: pattern,
        params: (handlerCtx.params ?? {}) as Record<string, string | undefined>,
        query: Object.fromEntries(url.searchParams),
        cookies: request.cookies,
        db,
        status: 200,
        setCookie: (name, value, options) => {
          setCookies.push({ name, value, options });
        },
      };

      // ponytail: guards keyed on the declared pattern, so they live in one place
      // instead of a global middleware that lacks the pattern. Unguarded endpoints
      // (the 404 catch-alls) mirror Elysia, where NOT_FOUND short-circuited
      // before onBeforeHandle. OPTIONS never reaches here: the CORS middleware
      // answers every OPTIONS with a 204 before routing (as in Elysia).
      return yield* Effect.tryPromise({
        try: async () => {
          try {
            if (guarded) {
              csrfGuard({ request: web, path: pattern, cookies: ctx.cookies });
              const throttler = await getThrottler();
              if (throttler !== null) {
                await throttler(STRICT_PATHS.has(pattern) ? 10 : 100)({
                  path: pattern,
                  request: web,
                });
              }
            }

            const result = await fn(ctx);
            const res =
              ctx.status === 204
                ? HttpServerResponse.empty({ status: 204 })
                : HttpServerResponse.jsonUnsafe(result, { status: ctx.status });
            return renderCookies(res, setCookies);
          } catch (e) {
            if (e instanceof ApiError) return apiErrorBody(e);
            throw e;
          }
        },
        catch: (e) => e,
      }).pipe(
        // Unexpected failures: log via the Logger service, answer 500.
        Effect.orDie,
        Effect.catchDefect((e: unknown) => {
          const message = e instanceof Error ? e.message : String(e);
          return Effect.gen(function* () {
            yield* Effect.logError(`${request.method} ${url.pathname} ${message}`);
            return HttpServerResponse.jsonUnsafe(nestBody(500, message), { status: 500 });
          });
        }),
      );
    });
}

export function bodyOf(ctx: Ctx): Promise<Record<string, unknown>> {
  return readJsonObject(ctx.http);
}

// ponytail: wildcard catch-alls beat fighting the router's 404 — serve's
// middleware cannot rewrite the response (documented), so we own the 404 route,
// unguarded: no CSRF, no throttle quota (Elysia's NOT_FOUND behaved the same).
export function wildcard404(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE') {
  return HttpRouter.add(method, `${PREFIX}/*`, (request) =>
    Effect.succeed(
      HttpServerResponse.jsonUnsafe(
        nestBody(404, `Cannot ${method} ${new URL(request.url, 'http://localhost').pathname}`),
        { status: 404 },
      ),
    ),
  );
}

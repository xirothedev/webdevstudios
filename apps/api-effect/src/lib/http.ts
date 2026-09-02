import { Duration, Effect, Layer } from 'effect';
import { type Cookies, HttpRouter, HttpServerRequest, HttpServerResponse } from 'effect/unstable/http';

import { ApiError, nestBody } from './errors';
import { csrfGuard } from './csrf';
import { getThrottler } from './throttle';
import { readJsonObject } from './validate';

export type CookieOptions = {
  httpOnly?: boolean;
  path?: string;
  sameSite?: 'strict' | 'lax' | 'none';
  // Seconds; converted to Duration at render (cookie libs read bare numbers as millis).
  maxAge?: number;
  secure?: boolean;
};

export type SetCookie = { name: string; value: string; options?: CookieOptions };

export type Ctx = {
  // Web Request behind the Bun adapter: method, headers, body.
  http: Request;
  request: HttpServerRequest.HttpServerRequest;
  // Route pattern (e.g. /v1/blog/posts/:slug), same role as Elysia's `route`.
  path: string;
  params: Record<string, string | undefined>;
  query: Record<string, string | undefined>;
  cookies: Record<string, string>;
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

function errorBody(
  e: unknown,
  where: string,
): Effect.Effect<HttpServerResponse.HttpServerResponse> {
  if (e instanceof ApiError) {
    return Effect.succeed(apiErrorBody(e));
  }
  const message = e instanceof Error ? e.message : String(e);
  console.error('[error]', where, message);
  return Effect.succeed(HttpServerResponse.jsonUnsafe(nestBody(500, message), { status: 500 }));
}

function renderCookies(
  res: HttpServerResponse.HttpServerResponse,
  setCookies: readonly SetCookie[],
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

function handle(
  pattern: string,
  guarded: boolean,
  handler: (ctx: Ctx) => Promise<unknown>,
): (
  request: HttpServerRequest.HttpServerRequest,
) => Effect.Effect<HttpServerResponse.HttpServerResponse, never, HttpRouter.RouteContext> {
  return (request) =>
    Effect.gen(function* () {
      const params = yield* HttpRouter.params;
      const web = yield* HttpServerRequest.toWeb(request);
      const url = new URL(request.url, 'http://localhost');
      const setCookies: SetCookie[] = [];
      const ctx: Ctx = {
        http: web,
        request,
        path: pattern,
        params,
        query: Object.fromEntries(url.searchParams),
        cookies: request.cookies,
        status: 200,
        setCookie: (name, value, options) => {
          setCookies.push({ name, value, options });
        },
      };

      // ponytail: csrf + throttle keyed on the declared pattern, so route-level
      // guards live in one place instead of a global middleware that lacks the
      // pattern. Unguarded = the 404 catch-alls, mirroring Elysia where NOT_FOUND
      // short-circuited before onBeforeHandle (no guards, no quota).
      // ApiError is rendered right here (Effect.tryPromise would squash its message);
      // anything else stays a defect for errorBody.
      return yield* Effect.tryPromise(async () => {
        try {
          // OPTIONS never reaches here: the global CORS middleware answers every
          // OPTIONS with a 204 preflight response before routing (as in Elysia),
          // so preflights can't burn strict-path quota (10/min).
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

          const result = await handler(ctx);
          const res =
            ctx.status === 204
              ? HttpServerResponse.empty({ status: 204 })
              : HttpServerResponse.jsonUnsafe(result, { status: ctx.status });
          return renderCookies(res, setCookies);
        } catch (e) {
          if (e instanceof ApiError) return apiErrorBody(e);
          throw e;
        }
      });
    }).pipe(
      Effect.orDie,
      Effect.catchDefect((e) => errorBody(e, `${request.method} ${pathname(request)}`)),
    );
}

function pathname(request: HttpServerRequest.HttpServerRequest): string {
  return new URL(request.url, 'http://localhost').pathname;
}

export function route(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS',
  path: string,
  handler: (ctx: Ctx) => Promise<unknown>,
  guarded = true,
): Layer.Layer<never, never, HttpRouter.HttpRouter> {
  // HttpRouter.add is itself a Layer that registers on the ambient router.
  return HttpRouter.add(method, `${PREFIX}${path}`, handle(`${PREFIX}${path}`, guarded, handler));
}

export function bodyOf(ctx: Ctx): Promise<Record<string, unknown>> {
  return readJsonObject(ctx.http);
}

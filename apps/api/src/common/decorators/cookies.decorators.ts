import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

type CookieMap = Record<string, string | undefined>;

/**
 * Retrieve cookies from the incoming request.
 * - `@Cookies()` returns the whole cookie map.
 * - `@Cookies('name')` returns the value of the named cookie.
 */
export const Cookies = createParamDecorator(
  (
    name: string | undefined,
    ctx: ExecutionContext
  ): string | CookieMap | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const cookies = (request.cookies || {}) as CookieMap;
    if (!name) return cookies;
    return cookies?.[name];
  }
);

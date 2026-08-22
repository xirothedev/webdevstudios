import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { describe, expect, test } from 'bun:test';
import type { ExecutionContext } from '@nestjs/common';

import { Cookies } from './cookies.decorators';
import { CurrentUser } from './current-user.decorator';

type ArgMeta = { index: number; factory: (data: unknown, ctx: ExecutionContext) => unknown };

const captureFactories = (): Record<number, ArgMeta> => {
  class Dummy {
    handler(
      @CurrentUser() _user: unknown,
      @Cookies() _allCookies: unknown,
      @Cookies('session') _oneCookie: unknown,
    ) {}
  }
  const meta = Reflect.getMetadata(ROUTE_ARGS_METADATA, Dummy, 'handler') as Record<
    string,
    ArgMeta
  >;
  return Object.fromEntries(Object.entries(meta).map(([, arg]) => [arg.index, arg]));
};

const fakeCtx = (request: Record<string, unknown>) =>
  ({ switchToHttp: () => ({ getRequest: () => request }) }) as unknown as ExecutionContext;

describe('param decorators', () => {
  const factories = captureFactories();
  const [currentUser, allCookies, namedCookie] = [factories[0], factories[1], factories[2]];

  test('CurrentUser yields request.user', () => {
    const user = { id: 'u1' };

    expect(currentUser.factory(undefined, fakeCtx({ user }))).toBe(user);
  });

  test('Cookies without a name yields the whole map', () => {
    const cookies = { session: 'abc', theme: 'dark' };

    expect(allCookies.factory(undefined, fakeCtx({ cookies }))).toEqual(cookies);
  });

  test('Cookies with a name yields just that value', () => {
    expect(namedCookie.factory('session', fakeCtx({ cookies: { session: 'abc' } }))).toBe('abc');
    expect(namedCookie.factory('missing', fakeCtx({ cookies: {} }))).toBeUndefined();
  });

  test('Cookies tolerates requests without cookies', () => {
    expect(allCookies.factory(undefined, fakeCtx({}))).toEqual({});
  });
});

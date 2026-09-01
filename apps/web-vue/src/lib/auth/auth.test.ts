import { describe, expect, test } from 'bun:test';
import axios, { type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';

import { apiClient, registerAuthLostHandler } from '@/lib/api-client';
import { adminRedirectFor, expiryRedirectTarget, isPublicRoute } from '@/lib/auth/policy';
import type { User } from '@/types/auth.types';

// Equivalence table: expected = behavior of the old api-client isPublicRoute, kept verbatim.
const PUBLIC_CASES: [string, boolean][] = [
  ['/', true],
  ['/shop', true],
  ['/blog', true],
  ['/partner', true],
  ['/shop/ao-thun', true],
  ['/auth/login', true],
  ['/blog/hello-world', true],
  ['/legal/privacy', true],
  ['/auth', false], // prefix needs the trailing slash — old behavior
  ['/shopx', false],
  ['/blogging', false],
  ['/cart', false],
  ['/checkout', false],
  ['/admin', false],
  ['/account/profile', false],
];

describe('auth policy', () => {
  test('public-route matcher matches the old behavior', () => {
    for (const [path, expected] of PUBLIC_CASES) {
      expect(isPublicRoute(path)).toBe(expected);
    }
  });

  test('expiry redirect target', () => {
    expect(expiryRedirectTarget('/cart')).toBe('/auth/login');
    expect(expiryRedirectTarget('/admin/users')).toBe('/auth/login');
    expect(expiryRedirectTarget('/')).toBeNull();
    expect(expiryRedirectTarget('/auth/login')).toBeNull();
  });

  test('admin guard decision', () => {
    expect(adminRedirectFor(undefined)).toBe('/auth/login');
    expect(adminRedirectFor({ role: 'USER' } as User)).toBe('/');
    expect(adminRedirectFor({ role: 'ADMIN' } as User)).toBe(true);
  });
});

describe('api-client auth-lost callback', () => {
  test('onAuthLost fires once when refresh fails on a 401', async () => {
    let lost = 0;
    registerAuthLostHandler(() => lost++);
    const boom = ((config: InternalAxiosRequestConfig) =>
      Promise.reject(
        Object.assign(new Error('Unauthorized'), {
          isAxiosError: true,
          config,
          response: {
            status: 401,
            statusText: 'Unauthorized',
            headers: {},
            config,
            data: { data: {} },
          },
        }),
      )) as AxiosAdapter;
    const real = axios.defaults.adapter;
    axios.defaults.adapter = boom;
    apiClient.defaults.adapter = boom;
    try {
      await apiClient.get('/some/protected').catch(() => undefined);
    } finally {
      axios.defaults.adapter = real;
      apiClient.defaults.adapter = real;
      registerAuthLostHandler(() => undefined);
    }
    expect(lost).toBe(1);
  });
});

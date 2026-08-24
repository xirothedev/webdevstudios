import { ConfigService } from '@nestjs/config';
import { describe, expect, test } from 'bun:test';
import type { Request, Response } from 'express';

import { CsrfService } from './csrf.service';

const makeReqRes = () => {
  const plantedCookies: Record<string, string> = {};
  const req = {
    sessionID: 'sess-1',
    ip: '127.0.0.1',
    headers: {},
    body: {},
    query: {},
    cookies: {},
  } as unknown as Request;
  const res = {
    cookie: (_name: string, value: string) => {
      plantedCookies['_csrf'] = value;
    },
  } as unknown as Response;
  return { req, res, plantedCookies };
};

const makeService = () =>
  new CsrfService(new ConfigService({ CSRF_SECRET: 'unit-test-csrf-secret' }));

describe('CsrfService', () => {
  test('generated tokens are returned and planted as a cookie', () => {
    const service = makeService();
    const { req, res, plantedCookies } = makeReqRes();

    const token = service.generateToken(req, res);

    expect(typeof token).toBe('string');
    expect(token).toMatch(/^[a-f0-9]+\.[a-f0-9]+$/);
    // the client echoes this exact value back via the x-csrf-token header
    expect(plantedCookies['_csrf']).toBe(token);
  });

  test('each generation yields a fresh token', () => {
    const service = makeService();
    const a = makeReqRes();
    const b = makeReqRes();

    const first = service.generateToken(a.req, a.res);
    const second = service.generateToken(b.req, b.res);

    expect(first).not.toBe(second);
  });

  test('getProtection exposes middleware', () => {
    const protection = makeService().getProtection();

    expect(typeof protection).toBe('function');
  });
});

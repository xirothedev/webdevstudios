import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { describe, expect, test } from 'bun:test';

import { TokenService } from './token.service';

const makeService = (config: Record<string, unknown> = {}) =>
  new TokenService(
    new JwtService({ secret: 'unit-test-secret' }),
    new ConfigService({
      JWT_ACCESS_TOKEN_EXPIRES_IN: '5m',
      JWT_REFRESH_TOKEN_EXPIRES_IN: '7d',
      ...config,
    }),
  );

describe('TokenService', () => {
  test('access tokens round-trip their payload', () => {
    const service = makeService();

    const token = service.generateAccessToken({
      sub: 'user-1',
      email: 'u@example.com',
      role: 'USER',
    });
    const payload = service.verifyToken(token);

    expect(payload.sub).toBe('user-1');
    expect(payload.email).toBe('u@example.com');
    expect(payload.role).toBe('USER');
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  test('refresh tokens round-trip and live longer than access tokens', () => {
    const service = makeService();

    const refresh = service.generateRefreshToken({ sub: 'user-1' });
    const payload = service.verifyToken(refresh);

    expect(payload.sub).toBe('user-1');

    const access = service.generateAccessToken({ sub: 'user-1', email: 'u@example.com' });
    const accessExp = (service.verifyToken(access).exp ?? 0) * 1000;
    const refreshExp = payload.exp! * 1000;
    expect(refreshExp - Date.now()).toBeGreaterThan(accessExp - Date.now());
  });

  test('access tokens carry the session id as jti when given', () => {
    const service = makeService();

    const token = service.generateAccessToken(
      { sub: 'user-1', email: 'u@example.com' },
      'session-1',
    );
    expect(service.verifyToken(token).jti).toBe('session-1');

    const bare = service.generateAccessToken({ sub: 'user-1', email: 'u@example.com' });
    expect(service.verifyToken(bare).jti).toBeUndefined();
  });

  test('tampered tokens do not verify', () => {
    const service = makeService();
    const token = service.generateAccessToken({ sub: 'user-1', email: 'u@example.com' });

    expect(() => service.verifyToken(`${token}x`)).toThrow();
    expect(() => service.verifyToken('not-a-jwt')).toThrow();
  });

  test('verification and reset tokens are 64-char hex', () => {
    const service = makeService();

    for (const token of [
      service.generateEmailVerificationToken(),
      service.generatePasswordResetToken(),
    ]) {
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    }
    expect(service.generateEmailVerificationToken()).not.toBe(
      service.generateEmailVerificationToken(),
    );
  });

  test('expirations honor configured seconds', async () => {
    const service = makeService({
      EMAIL_VERIFICATION_TOKEN_EXPIRES_IN: 120,
      PASSWORD_RESET_TOKEN_EXPIRES_IN: 60,
    });

    const before = Date.now();
    const emailExp = service.getEmailVerificationExpiration().getTime();
    const resetExp = service.getPasswordResetExpiration().getTime();

    // ponytail: allow scheduler slop of 2s around the assertion
    expect(emailExp - before).toBeGreaterThanOrEqual(118_000);
    expect(resetExp - before).toBeLessThanOrEqual(62_000);
  });
});

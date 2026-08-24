import { describe, expect, test } from 'bun:test';
import * as speakeasy from 'speakeasy';

import { TotpService } from './totp.service';

describe('TotpService', () => {
  const service = new TotpService();

  test('generates base32 secrets', () => {
    const secret = service.generateSecret('user@example.com');

    expect(secret).toMatch(/^[A-Z2-7]+=*$/);
    expect(secret.length).toBeGreaterThanOrEqual(32);
  });

  test('QR code is a PNG data URL', async () => {
    const qr = await service.generateQRCode('BASE32SECRET234', 'user@example.com');

    expect(qr.startsWith('data:image/png;base64,')).toBe(true);
  });

  test('a live TOTP code verifies against its own secret', () => {
    const secret = service.generateSecret('user@example.com');
    // ponytail: speakeasy exports totp as a bare callable whose internals need the receiver
    const code = (speakeasy.totp as unknown as (this: unknown, o: object) => string).call(
      speakeasy,
      { secret, encoding: 'base32' },
    );

    expect(service.verifyCode(secret, code)).toBe(true);
  });

  test('wrong codes are rejected', () => {
    const secret = service.generateSecret('user@example.com');

    // six digits but (almost surely) not the current TOTP step
    expect(service.verifyCode(secret, '000000')).toBe(false);
    expect(service.verifyCode(secret, 'garbage')).toBe(false);
  });

  test('backup codes are unique 8-digit numbers', () => {
    const codes = service.generateBackupCodes();

    expect(codes).toHaveLength(10);
    for (const code of codes) {
      expect(code).toMatch(/^\d{8}$/);
    }
    expect(new Set(codes).size).toBe(codes.length);

    expect(service.generateBackupCodes(3)).toHaveLength(3);
  });
});

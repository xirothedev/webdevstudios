import { randomInt } from 'node:crypto';

import { toDataURL } from 'qrcode';
// ponytail: named imports break at runtime — speakeasy's CJS functions use `this`,
// so call through the module namespace (Bun default import = module.exports).
import speakeasy from 'speakeasy';

export function generateTotpSecret(): string {
  return speakeasy.generateSecret({ length: 32 }).base32;
}

export function verifyTotp(secret: string, code: string): boolean {
  return speakeasy.totp.verify({ secret, token: code, encoding: 'base32', window: 2 });
}

export function generateBackupCodes(count: number): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i += 1) {
    codes.push(String(10000000 + randomInt(0, 90000000)).padStart(8, '0'));
  }
  return codes;
}

// ponytail: mirrors Go's urlEscape (ReplaceAll of : @ and space).
function urlEscape(value: string): string {
  return value.replaceAll(':', '%3A').replaceAll('@', '%40').replaceAll(' ', '%20');
}

export function otpauthUrl(email: string, secret: string): string {
  return `otpauth://totp/WebDev%20Studios:${urlEscape(email)}?secret=${secret}&issuer=WebDev%20Studios&period=30&digits=6`;
}

export function toQrDataUrl(text: string): Promise<string> {
  return toDataURL(text, { width: 256, margin: 1 });
}

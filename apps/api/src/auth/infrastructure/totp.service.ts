import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as speakeasy from 'speakeasy';

@Injectable()
export class TotpService {
  // constructor() {}

  generateSecret(email: string): string {
    return speakeasy.generateSecret({
      name: `WebDev Studios (${email})`,
      issuer: 'WebDev Studios',
      length: 32,
    }).base32;
  }

  async generateQRCode(secret: string, email: string): Promise<string> {
    const otpauthUrl = speakeasy.otpauthURL({
      secret,
      label: email,
      issuer: 'WebDev Studios',
      encoding: 'base32',
    });

    return QRCode.toDataURL(otpauthUrl);
  }

  verifyCode(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps (60 seconds) of tolerance
    });
  }

  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-digit backup codes
      const code = Math.floor(10000000 + Math.random() * 90000000).toString();
      codes.push(code);
    }
    return codes;
  }
}

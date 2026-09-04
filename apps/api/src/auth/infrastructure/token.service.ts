/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { StringValue } from 'ms';
import { addSeconds } from 'date-fns';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // jsonwebtoken parses a bare numeric string as milliseconds; JWT_*_EXPIRES_IN config is in seconds.
  private expiresIn(key: string, fallbackSeconds: number): number | StringValue {
    const raw = this.configService.get<string>(key, String(fallbackSeconds));
    const seconds = Number(raw);
    return Number.isNaN(seconds) ? (raw as StringValue) : seconds;
  }

  generateAccessToken(
    payload: { sub: string; email: string; role?: string },
    sessionId?: string,
  ): string {
    // jti carries the Session id so identity survives refresh rotation
    const claims = sessionId ? { ...payload, jti: sessionId } : payload;
    return this.jwtService.sign(claims, {
      expiresIn: this.expiresIn('JWT_ACCESS_TOKEN_EXPIRES_IN', 3600),
    });
  }

  generateRefreshToken(payload: { sub: string }): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.expiresIn('JWT_REFRESH_TOKEN_EXPIRES_IN', 604800),
    });
  }

  verifyToken(token: string): {
    sub: string;
    email?: string;
    role?: string;
    jti?: string;
    iat?: number;
    exp?: number;
  } {
    return this.jwtService.verify(token);
  }

  generateEmailVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  generatePasswordResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  getEmailVerificationExpiration(): Date {
    const expiresIn = this.configService.get<number>('EMAIL_VERIFICATION_TOKEN_EXPIRES_IN', 86400);
    return addSeconds(new Date(), expiresIn);
  }

  getPasswordResetExpiration(): Date {
    const expiresIn = this.configService.get<number>('PASSWORD_RESET_TOKEN_EXPIRES_IN', 3600);
    return addSeconds(new Date(), expiresIn);
  }
}

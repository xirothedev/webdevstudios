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
import type { Response } from 'express';

export interface AuthCookieTokens {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_COOKIE_MAX_AGE_MS = 15 * 60 * 1000;

/**
 * Single owner of auth cookie writes at the HTTP seam.
 * Every flow passes the same ttlSeconds it gave SessionIssuer so the
 * refresh_token cookie cannot outlive (or die before) the Session row.
 */
@Injectable()
export class AuthCookies {
  constructor(private readonly configService: ConfigService) {}

  set(res: Response, tokens: AuthCookieTokens, ttlSeconds: number): void {
    const secure = this.configService.get('NODE_ENV') === 'production';

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax', // Always lax for multiple ports/subdomains
      maxAge: ACCESS_COOKIE_MAX_AGE_MS,
      path: '/',
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax', // Always lax for multiple ports/subdomains
      maxAge: ttlSeconds * 1000,
      path: '/',
    });
  }

  clear(res: Response): void {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
  }
}

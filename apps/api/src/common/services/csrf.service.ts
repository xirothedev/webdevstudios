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
import {
  doubleCsrf,
  DoubleCsrfConfigOptions,
  DoubleCsrfUtilities,
} from 'csrf-csrf';
import type { Request, Response } from 'express';

/**
 * CSRF Service
 * Handles CSRF token generation and validation
 */
@Injectable()
export class CsrfService {
  private readonly csrfUtilities: DoubleCsrfUtilities;
  private readonly isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isProduction = process.env.NODE_ENV === 'production';

    const csrfOptions: DoubleCsrfConfigOptions = {
      getSecret: () => {
        return this.configService.getOrThrow<string>('CSRF_SECRET');
      },
      getSessionIdentifier: (req: Request) => {
        // Use session ID or IP as identifier
        return req.sessionID || req.ip || 'anonymous';
      },
      cookieName: '_csrf',
      cookieOptions: {
        httpOnly: true,
        secure: this.isProduction,
        sameSite: 'lax', // Always lax for multiple ports/subdomains
        path: '/',
      },
      getCsrfTokenFromRequest: (req: Request) => {
        // Try to get token from header first, then body
        return (
          (req.headers['x-csrf-token'] as string | undefined) ||
          (req.body && req.body._csrf) ||
          (req.query && (req.query._csrf as string | undefined))
        );
      },
      size: 32,
    };

    this.csrfUtilities = doubleCsrf(csrfOptions);
  }

  /**
   * Generate CSRF token for client
   */
  generateToken(req: Request, res: Response): string {
    return this.csrfUtilities.generateCsrfToken(req, res);
  }

  /**
   * Get CSRF protection middleware function
   */
  getProtection() {
    return this.csrfUtilities.doubleCsrfProtection;
  }
}

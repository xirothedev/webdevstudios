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

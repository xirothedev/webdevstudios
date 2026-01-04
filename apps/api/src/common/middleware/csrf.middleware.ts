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

import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import type { AuthenticatedUser } from '@/types/express';

import { CsrfService } from '../services/csrf.service';
import { SecurityLoggerService } from '../services/security-logger.service';

/**
 * CSRF Protection Middleware
 * Validates CSRF tokens for state-changing requests
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly csrfProtection: ReturnType<
    typeof CsrfService.prototype.getProtection
  >;

  constructor(
    readonly csrfService: CsrfService,
    private readonly securityLogger: SecurityLoggerService
  ) {
    this.csrfProtection = csrfService.getProtection();
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Skip CSRF for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Skip CSRF for OAuth routes (they use redirects)
    if (req.path.startsWith('/v1/auth/oauth')) {
      return next();
    }

    // Skip CSRF for refresh token endpoint (protected by refresh token itself)
    if (req.path === '/v1/auth/refresh') {
      return next();
    }

    // Skip CSRF for webhook routes (external services)
    if (req.path.startsWith('/v1/payments/webhook')) {
      return next();
    }

    // Skip CSRF for Swagger docs
    if (req.path.startsWith('/v1/docs')) {
      return next();
    }

    // Skip CSRF for CSRF token endpoint
    if (req.path === '/v1/csrf-token') {
      return next();
    }

    // Validate CSRF token using csrf-csrf middleware
    this.csrfProtection(req, res, (err) => {
      if (err) {
        // Log CSRF failure
        const user = req.user as AuthenticatedUser | undefined;
        this.securityLogger.logCsrfFailure(
          req.path,
          req.method,
          req.ip,
          user?.id
        );
        return next(err);
      }
      next();
    });
  }
}

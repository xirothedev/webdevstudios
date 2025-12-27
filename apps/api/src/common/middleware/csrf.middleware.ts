import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { CsrfService } from '../services/csrf.service';

/**
 * CSRF Protection Middleware
 * Validates CSRF tokens for state-changing requests
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly csrfProtection: ReturnType<
    typeof CsrfService.prototype.getProtection
  >;

  constructor(private readonly csrfService: CsrfService) {
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
    this.csrfProtection(req, res, next);
  }
}

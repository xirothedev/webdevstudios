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

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import {
  SecurityEventType,
  SecurityLoggerService,
} from '../services/security-logger.service';

@Injectable()
export class SecurityLoggingInterceptor implements NestInterceptor {
  constructor(private readonly securityLogger: SecurityLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, path, ip, headers } = request;
    const userAgent = headers['user-agent'];
    const userId = (request as any).user?.id;

    return next.handle().pipe(
      tap(() => {
        // Log successful sensitive operations
        if (this.isSensitiveOperation(path, method)) {
          this.securityLogger.logEvent({
            type: SecurityEventType.AUTH_SUCCESS,
            severity: 'low',
            message: `Sensitive operation: ${method} ${path}`,
            userId,
            ipAddress: ip,
            userAgent,
            path,
            method,
          });
        }
      }),
      catchError((error) => {
        const status = error?.status || error?.statusCode || 500;

        // Log security-related errors
        if (status === 401) {
          this.securityLogger.logAuthFailure(
            request.body?.email || 'unknown',
            error.message,
            ip,
            userAgent
          );
        } else if (status === 403) {
          this.securityLogger.logEvent({
            type: SecurityEventType.AUTHORIZATION_FAILURE,
            severity: 'medium',
            message: `Authorization failed: ${error.message}`,
            userId,
            ipAddress: ip,
            userAgent,
            path,
            method,
          });
        } else if (status === 429) {
          this.securityLogger.logRateLimitExceeded(path, method, ip, userId);
        }

        return throwError(() => error);
      })
    );
  }

  private isSensitiveOperation(path: string, method: string): boolean {
    const sensitivePaths = [
      '/auth/login',
      '/auth/logout',
      '/auth/password/reset',
      '/users',
      '/payments',
      '/orders',
    ];

    const sensitiveMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

    return (
      sensitiveMethods.includes(method) &&
      sensitivePaths.some((p) => path.includes(p))
    );
  }
}

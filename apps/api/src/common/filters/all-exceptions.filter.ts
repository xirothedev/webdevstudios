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
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Catch all unhandled exceptions (non-HTTP exceptions)
 * HttpExceptionFilter will handle HTTP exceptions
 * This ensures no sensitive information leaks to clients
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    // Skip if it's an HttpException (let HttpExceptionFilter handle it)
    if (exception instanceof HttpException) {
      return;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Extract error message
    let originalMessage = 'An internal error occurred';
    if (exception instanceof Error) {
      originalMessage = exception.message;
    } else {
      originalMessage = String(exception);
    }

    // Log full error details (server-side only)
    this.logger.error(
      `Unhandled exception: ${originalMessage}`,
      exception instanceof Error ? exception.stack : String(exception),
      {
        path: request.url,
        method: request.method,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        userId: (request as any).user?.id,
      }
    );

    // Sanitize response for production
    const safeMessage = this.isProduction
      ? 'An internal error occurred. Please try again later.'
      : originalMessage;

    const errorResponse = {
      success: false,
      data: null,
      message: safeMessage,
      error: exception instanceof Error ? exception.name : 'Error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      // Only include detailed error in development
      ...(this.isProduction
        ? {}
        : {
            details: originalMessage,
            stack: exception instanceof Error ? exception.stack : undefined,
          }),
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}

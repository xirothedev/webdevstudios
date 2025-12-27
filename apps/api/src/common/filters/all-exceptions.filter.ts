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

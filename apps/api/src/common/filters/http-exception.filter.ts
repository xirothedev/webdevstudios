import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

/**
 * Sanitize error message to prevent information disclosure
 */
function sanitizeErrorMessage(
  message: string | string[],
  isProduction: boolean
): string {
  if (Array.isArray(message)) {
    return message.join(', ');
  }

  const errorMessage = String(message);

  // In production, sanitize sensitive information
  if (isProduction) {
    // Remove stack traces
    if (errorMessage.includes('at ') || errorMessage.includes('Error:')) {
      return 'An error occurred. Please try again later.';
    }

    // Remove database error details
    if (
      errorMessage.toLowerCase().includes('prisma') ||
      errorMessage.toLowerCase().includes('database') ||
      errorMessage.toLowerCase().includes('sql') ||
      errorMessage.toLowerCase().includes('connection')
    ) {
      return 'Database error occurred. Please try again later.';
    }

    // Remove file system paths
    if (errorMessage.includes('/') || errorMessage.includes('\\')) {
      return 'An error occurred. Please try again later.';
    }

    // Remove sensitive patterns (tokens, keys, etc.)
    const sensitivePatterns = [
      /token[=:]\s*[\w-]+/gi,
      /key[=:]\s*[\w-]+/gi,
      /secret[=:]\s*[\w-]+/gi,
      /password[=:]\s*[\w-]+/gi,
      /authorization[=:]\s*[\w-]+/gi,
    ];

    let sanitized = errorMessage;
    for (const pattern of sensitivePatterns) {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }

    return sanitized;
  }

  // In development, return original message for debugging
  return errorMessage;
}

/**
 * Check if error message contains sensitive information
 */
function containsSensitiveInfo(message: string): boolean {
  const sensitivePatterns = [
    /token[=:]\s*[\w-]+/gi,
    /key[=:]\s*[\w-]+/gi,
    /secret[=:]\s*[\w-]+/gi,
    /password[=:]\s*[\w-]+/gi,
    /authorization[=:]\s*[\w-]+/gi,
    /at\s+\w+/i, // Stack traces
    /Error:/i,
    /prisma/i,
    /database/i,
    /sql/i,
    /connection/i,
    /\/[\w/.-]+/i, // File paths
    /\\[\w\\.-]+/i, // Windows paths
  ];

  return sensitivePatterns.some((pattern) => pattern.test(message));
}

/**
 * Get safe error message - preserve custom messages if safe, otherwise use generic
 */
function getSafeErrorMessage(
  status: number,
  sanitizedMessage: string,
  isProduction: boolean
): string {
  // If not production, return original message
  if (!isProduction) {
    return sanitizedMessage;
  }

  // If sanitized message doesn't contain sensitive info, use it
  // This allows custom business logic messages to be displayed
  if (!containsSensitiveInfo(sanitizedMessage)) {
    return sanitizedMessage;
  }

  // Otherwise, use generic safe messages based on status code
  const safeMessages: Record<number, string> = {
    [HttpStatus.BAD_REQUEST]: 'Invalid request. Please check your input.',
    [HttpStatus.UNAUTHORIZED]: 'Authentication required.',
    [HttpStatus.FORBIDDEN]:
      'You do not have permission to perform this action.',
    [HttpStatus.NOT_FOUND]: 'The requested resource was not found.',
    [HttpStatus.CONFLICT]: 'A conflict occurred. Please try again.',
    [HttpStatus.UNPROCESSABLE_ENTITY]:
      'Validation failed. Please check your input.',
    [HttpStatus.TOO_MANY_REQUESTS]:
      'Too many requests. Please try again later.',
    [HttpStatus.INTERNAL_SERVER_ERROR]:
      'An internal error occurred. Please try again later.',
    [HttpStatus.SERVICE_UNAVAILABLE]:
      'Service temporarily unavailable. Please try again later.',
  };

  return safeMessages[status] || 'An error occurred. Please try again later.';
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private readonly isProduction: boolean;

  constructor(private readonly configService?: ConfigService) {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extract original message
    const originalMessage =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message ||
          exception.message ||
          'An error occurred';

    // Sanitize message for production
    const sanitizedMessage = sanitizeErrorMessage(
      originalMessage,
      this.isProduction
    );

    // Get safe error message based on status code
    const safeMessage = getSafeErrorMessage(
      status,
      sanitizedMessage,
      this.isProduction
    );

    // Log detailed error (server-side only)
    if (this.isProduction) {
      this.logger.error(`[${status}] ${exception.name}: ${originalMessage}`, {
        path: request.url,
        method: request.method,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        userId: (request as any).user?.id,
      });
    } else {
      // In development, log full details
      this.logger.debug(
        `[${status}] ${exception.name}: ${originalMessage}`,
        exception.stack
      );
    }

    const errorResponse = {
      success: false,
      data: null,
      message: safeMessage,
      error: exception.name,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      // Only include detailed error in development
      ...(this.isProduction
        ? {}
        : {
            details: originalMessage,
            stack: exception.stack,
          }),
    };

    response.status(status).json(errorResponse);
  }
}

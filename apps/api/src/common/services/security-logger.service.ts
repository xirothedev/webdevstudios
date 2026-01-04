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

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as winston from 'winston';

import { PrismaService } from '@/prisma/prisma.service';

export enum SecurityEventType {
  AUTH_FAILURE = 'AUTH_FAILURE',
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  AUTHORIZATION_FAILURE = 'AUTHORIZATION_FAILURE',
  CSRF_FAILURE = 'CSRF_FAILURE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  DATA_INTEGRITY_FAILURE = 'DATA_INTEGRITY_FAILURE',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  WEBHOOK_SIGNATURE_FAILURE = 'WEBHOOK_SIGNATURE_FAILURE',
}

export interface SecurityEvent {
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

@Injectable()
export class SecurityLoggerService {
  private readonly logger: winston.Logger;
  private readonly alertThreshold: number;
  private readonly logToDatabase: boolean;
  private readonly nestLogger = new Logger(SecurityLoggerService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.alertThreshold = this.configService.get<number>(
      'SECURITY_ALERT_THRESHOLD',
      5
    );
    this.logToDatabase = this.configService.get<boolean>(
      'LOG_TO_DATABASE',
      true
    );

    // Setup Winston logger
    const logDir = this.configService.get<string>('LOG_DIR', './logs');
    const isProduction = process.env.NODE_ENV === 'production';

    this.logger = winston.createLogger({
      level: isProduction ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        // Console transport (development)
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
        // File transport - All logs
        new winston.transports.File({
          filename: join(logDir, 'app.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // File transport - Security logs only
        new winston.transports.File({
          filename: join(logDir, 'security.log'),
          level: 'warn',
          maxsize: 5242880, // 5MB
          maxFiles: 10, // Keep more security logs
        }),
        // File transport - Errors only
        new winston.transports.File({
          filename: join(logDir, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    });
  }

  /**
   * Log security event
   */
  async logEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
    };

    // 1. Log to file (Winston)
    const logLevel = this.getWinstonLevel(event.severity);
    this.logger.log(logLevel, `[${event.type}] ${event.message}`, fullEvent);

    // 2. Log to database (for critical/high severity)
    if (this.logToDatabase && this.shouldStoreInDatabase(fullEvent)) {
      await this.storeInDatabase(fullEvent).catch((error) => {
        // Fallback: log error to file if DB fails
        this.logger.error('Failed to store security event in database', {
          error: error.message,
          event: fullEvent,
        });
        this.nestLogger.error(
          'Failed to store security event in database',
          error.stack
        );
      });
    }

    // 3. Send alert if needed
    if (this.shouldAlert(fullEvent)) {
      await this.sendAlert(fullEvent);
    }
  }

  /**
   * Store security event in database
   */
  private async storeInDatabase(event: SecurityEvent): Promise<void> {
    await this.prisma.securityLog.create({
      data: {
        type: event.type,
        severity: event.severity,
        message: event.message,
        userId: event.userId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        path: event.path,
        method: event.method,
        metadata: (event.metadata || {}) as any,
        timestamp: event.timestamp,
      },
    });
  }

  /**
   * Check if event should be stored in database
   */
  private shouldStoreInDatabase(event: SecurityEvent): boolean {
    const storeSeverities: SecurityEvent['severity'][] = ['high', 'critical'];
    const storeTypes = [
      SecurityEventType.AUTH_FAILURE,
      SecurityEventType.AUTHORIZATION_FAILURE,
      SecurityEventType.CSRF_FAILURE,
      SecurityEventType.DATA_INTEGRITY_FAILURE,
      SecurityEventType.SUSPICIOUS_ACTIVITY,
    ];

    return (
      storeSeverities.includes(event.severity) ||
      storeTypes.includes(event.type)
    );
  }

  /**
   * Convert severity to Winston log level
   */
  private getWinstonLevel(severity: SecurityEvent['severity']): string {
    const mapping: Record<SecurityEvent['severity'], string> = {
      low: 'info',
      medium: 'warn',
      high: 'error',
      critical: 'error',
    };
    return mapping[severity] || 'info';
  }

  /**
   * Check if alert should be sent
   */
  private shouldAlert(event: SecurityEvent): boolean {
    const criticalTypes = [
      SecurityEventType.DATA_INTEGRITY_FAILURE,
      SecurityEventType.SUSPICIOUS_ACTIVITY,
    ];

    return (
      event.severity === 'critical' ||
      criticalTypes.includes(event.type) ||
      event.severity === 'high'
    );
  }

  /**
   * Send alert (email, Slack, etc.)
   */
  private async sendAlert(event: SecurityEvent): Promise<void> {
    // Log critical alert
    this.logger.error(
      `🚨 SECURITY ALERT: ${event.type} - ${event.message}`,
      event
    );
    this.nestLogger.error(
      `🚨 SECURITY ALERT: ${event.type} - ${event.message}`,
      JSON.stringify(event, null, 2)
    );

    // TODO: Send email/Slack notification
    // await this.mailService.sendSecurityAlert(event);
  }

  /**
   * Log authentication failure
   */
  async logAuthFailure(
    email: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logEvent({
      type: SecurityEventType.AUTH_FAILURE,
      severity: 'medium',
      message: `Authentication failed for ${email}: ${reason}`,
      ipAddress,
      userAgent,
      metadata: { email, reason },
    });
  }

  /**
   * Log CSRF failure
   */
  async logCsrfFailure(
    path: string,
    method: string,
    ipAddress?: string,
    userId?: string
  ): Promise<void> {
    await this.logEvent({
      type: SecurityEventType.CSRF_FAILURE,
      severity: 'high',
      message: `CSRF token validation failed for ${method} ${path}`,
      path,
      method,
      ipAddress,
      userId,
    });
  }

  /**
   * Log rate limit exceeded
   */
  async logRateLimitExceeded(
    path: string,
    method: string,
    ipAddress?: string,
    userId?: string
  ): Promise<void> {
    await this.logEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      severity: 'medium',
      message: `Rate limit exceeded for ${method} ${path}`,
      path,
      method,
      ipAddress,
      userId,
    });
  }

  /**
   * Log data integrity failure
   */
  async logDataIntegrityFailure(
    type: string,
    details: string,
    ipAddress?: string
  ): Promise<void> {
    await this.logEvent({
      type: SecurityEventType.DATA_INTEGRITY_FAILURE,
      severity: 'critical',
      message: `Data integrity failure: ${type} - ${details}`,
      ipAddress,
      metadata: { type, details },
    });
  }

  /**
   * Log webhook signature failure
   */
  async logWebhookSignatureFailure(
    path: string,
    ipAddress?: string
  ): Promise<void> {
    await this.logEvent({
      type: SecurityEventType.WEBHOOK_SIGNATURE_FAILURE,
      severity: 'high',
      message: `Webhook signature validation failed for ${path}`,
      path,
      ipAddress,
    });
  }
}

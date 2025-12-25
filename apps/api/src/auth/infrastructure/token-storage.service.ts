import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class TokenStorageService {
  private readonly client: Redis;
  private readonly emailVerificationPrefix = 'email-verification:';
  private readonly passwordResetPrefix = 'password-reset:';
  private readonly sessionMfaPrefix = 'session:';

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });
  }

  /**
   * Store email verification token in Redis
   * @param token - Verification token
   * @param userId - User ID
   * @returns Promise<void>
   */
  async storeEmailVerificationToken(
    token: string,
    userId: string
  ): Promise<void> {
    const key = `${this.emailVerificationPrefix}${token}`;
    const ttl = this.configService.get<number>(
      'EMAIL_VERIFICATION_TOKEN_EXPIRES_IN',
      86400
    ); // Default 24 hours

    await this.client.setex(key, ttl, userId);
  }

  /**
   * Get and verify email verification token from Redis
   * @param token - Verification token
   * @returns User ID if token is valid, null otherwise
   */
  async getEmailVerificationToken(token: string): Promise<string | null> {
    const key = `${this.emailVerificationPrefix}${token}`;
    const userId = await this.client.get(key);
    return userId;
  }

  /**
   * Delete email verification token from Redis (after successful verification)
   * @param token - Verification token
   */
  async deleteEmailVerificationToken(token: string): Promise<void> {
    const key = `${this.emailVerificationPrefix}${token}`;
    await this.client.del(key);
  }

  /**
   * Store password reset token in Redis
   * @param token - Reset token
   * @param userId - User ID
   * @returns Promise<void>
   */
  async storePasswordResetToken(token: string, userId: string): Promise<void> {
    const key = `${this.passwordResetPrefix}${token}`;
    const ttl = this.configService.get<number>(
      'PASSWORD_RESET_TOKEN_EXPIRES_IN',
      3600
    ); // Default 1 hour

    await this.client.setex(key, ttl, userId);
  }

  /**
   * Get and verify password reset token from Redis
   * @param token - Reset token
   * @returns User ID if token is valid, null otherwise
   */
  async getPasswordResetToken(token: string): Promise<string | null> {
    const key = `${this.passwordResetPrefix}${token}`;
    const userId = await this.client.get(key);
    return userId;
  }

  /**
   * Delete password reset token from Redis (after successful reset)
   * @param token - Reset token
   */
  async deletePasswordResetToken(token: string): Promise<void> {
    const key = `${this.passwordResetPrefix}${token}`;
    await this.client.del(key);
  }

  /**
   * Store MFA verification status for a session in Redis
   * @param sessionId - Session ID
   * @param ttl - Time to live in seconds (should match JWT expiration)
   * @returns Promise<void>
   */
  async storeSessionMfaVerified(sessionId: string, ttl: number): Promise<void> {
    const key = `${this.sessionMfaPrefix}${sessionId}:mfaVerified`;
    await this.client.setex(key, ttl, 'true');
  }

  /**
   * Get MFA verification status for a session from Redis
   * @param sessionId - Session ID
   * @returns true if MFA is verified, false otherwise
   */
  async getSessionMfaVerified(sessionId: string): Promise<boolean> {
    const key = `${this.sessionMfaPrefix}${sessionId}:mfaVerified`;
    const value = await this.client.get(key);
    return value === 'true';
  }

  /**
   * Delete MFA verification status for a session from Redis
   * @param sessionId - Session ID
   */
  async deleteSessionMfaVerified(sessionId: string): Promise<void> {
    const key = `${this.sessionMfaPrefix}${sessionId}:mfaVerified`;
    await this.client.del(key);
  }
}

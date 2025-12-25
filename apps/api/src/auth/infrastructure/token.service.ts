import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { StringValue } from 'ms';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  generateAccessToken(payload: {
    sub: string;
    email: string;
    role?: string;
  }): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get<StringValue>(
        'JWT_ACCESS_TOKEN_EXPIRES_IN',
        '3600'
      ),
    });
  }

  generateRefreshToken(payload: { sub: string }): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get<StringValue>(
        'JWT_REFRESH_TOKEN_EXPIRES_IN',
        '604800'
      ),
    });
  }

  verifyToken(token: string): {
    sub: string;
    email?: string;
    role?: string;
    iat?: number;
    exp?: number;
  } {
    return this.jwtService.verify(token);
  }

  generateEmailVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  generatePasswordResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  getEmailVerificationExpiration(): Date {
    const expiresIn = this.configService.get<number>(
      'EMAIL_VERIFICATION_TOKEN_EXPIRES_IN',
      86400
    );
    return new Date(Date.now() + expiresIn * 1000);
  }

  getPasswordResetExpiration(): Date {
    const expiresIn = this.configService.get<number>(
      'PASSWORD_RESET_TOKEN_EXPIRES_IN',
      3600
    );
    return new Date(Date.now() + expiresIn * 1000);
  }
}

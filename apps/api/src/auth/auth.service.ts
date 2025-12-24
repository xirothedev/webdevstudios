import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { Payload } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async generateTokenFromUser(user: Payload): Promise<string> {
    return this.jwt.sign(
      {
        sub: user.sub,
        email: user.email,
        role: user.role,
      },
      {
        secret: this.config.getOrThrow<string>('JWT_SECRET_KEY'),
        expiresIn: this.config.getOrThrow<number>(
          'JWT_ACCESS_TOKEN_EXPIRES_IN'
        ),
      }
    );
  }

  async extractUserFromToken(token: string): Promise<Payload> {
    return this.jwt.verify(token, {
      secret: this.config.getOrThrow<string>('JWT_SECRET_KEY'),
    });
  }
}

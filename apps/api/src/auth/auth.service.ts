import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { hash } from 'argon2';

import { PrismaService } from '@/prisma/prisma.service';

import { Payload } from './auth.interface';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  async generateTokenFromUser(
    user: Payload,
    tokenType: TokenType
  ): Promise<string> {
    const options: JwtSignOptions = {
      secret: this.config.getOrThrow<string>(
        tokenType === TokenType.ACCESS
          ? 'JWT_SECRET_KEY'
          : 'JWT_REFRESH_TOKEN_SECRET_KEY'
      ),
      expiresIn: this.config.getOrThrow<number>(
        tokenType === TokenType.ACCESS
          ? 'JWT_ACCESS_TOKEN_EXPIRES_IN'
          : 'JWT_REFRESH_TOKEN_EXPIRES_IN'
      ),
    };
    return this.jwt.sign(
      {
        sub: user.sub,
        email: user.email,
        role: user.role,
      },
      options
    );
  }

  async extractUserFromToken(
    token: string,
    tokenType: TokenType
  ): Promise<Payload> {
    const options: JwtVerifyOptions = {
      secret: this.config.getOrThrow<string>(
        tokenType === TokenType.ACCESS
          ? 'JWT_SECRET_KEY'
          : 'JWT_REFRESH_TOKEN_SECRET_KEY'
      ),
    };

    return this.jwt.verify(token, options);
  }

  async createUserSession(user: Payload, refreshToken: string) {
    await this.prisma.session.create({
      data: {
        userId: user.sub,
        token: await hash(crypto.randomUUID()),
        expiresAt: new Date(
          Date.now() +
            1000 *
              this.config.getOrThrow<number>('JWT_REFRESH_TOKEN_EXPIRES_IN')
        ),
        refreshToken: await hash(refreshToken),
      },
    });
  }

  async updateUserSession(user: Payload, refreshToken: string) {
    this.prisma.session.updateMany({
      where: { userId: user.sub },
      data: {
        refreshToken: await hash(refreshToken),
      },
    });
  }

  async deleteUserSession(userId: string) {
    this.prisma.session.deleteMany({
      where: { userId },
    });
  }
}

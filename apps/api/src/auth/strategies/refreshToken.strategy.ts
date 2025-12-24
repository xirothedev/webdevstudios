import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

import { PrismaService } from '@/prisma/prisma.service';

import { Payload } from '../auth.interface';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token'
) {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: (req) => {
        return req.cookies.refresh_token;
      },
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET_KEY'),
    });
  }

  async validate(payload: Payload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        avatar: true,
        fullName: true,
        createdAt: true,
        emailVerified: true,
      },
    });

    if (!user || (user && !user.emailVerified)) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  }
}

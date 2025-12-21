import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '@/prisma/prisma.service';

import { userInfoDto } from '../dto/userInfo.dto';
import { GetProfileQueryByToken } from '../queries/getProfileByToken.query';

@Injectable()
@QueryHandler(GetProfileQueryByToken)
export class GetProfileByTokenHandler implements IQueryHandler<
  GetProfileQueryByToken,
  userInfoDto
> {
  constructor(
    private config: ConfigService,
    private readonly prisma: PrismaService,
    private jwt: JwtService
  ) {}

  async execute(query: GetProfileQueryByToken): Promise<userInfoDto> {
    const token = query.token;
    let user: userInfoDto;
    try {
      // rely on JwtModule registration for secret; avoid passing undefined secret
      user = await this.jwt.verifyAsync(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET_KEY'),
      });
    } catch (_err) {
      throw new UnauthorizedException('Invalid or expired token');
      console.log(_err);
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}

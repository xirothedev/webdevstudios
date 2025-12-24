import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';

import { PrismaService } from '@/prisma/prisma.service';

import { userInfoDto } from '../../dto/userInfo.dto';
import { GetProfileQueryByToken } from '../impl/getProfileByToken.query';

@Injectable()
@QueryHandler(GetProfileQueryByToken)
export class GetProfileByTokenHandler implements IQueryHandler<
  GetProfileQueryByToken,
  userInfoDto
> {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private jwt: JwtService
  ) {}

  async execute(query: GetProfileQueryByToken): Promise<userInfoDto> {
    const token = query.token;
    let user: userInfoDto;
    try {
      // rely on JwtModule registration for secret; avoid passing undefined secret
      const { id } = await this.jwt.verifyAsync(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET_KEY'),
      });

      console.log(id);

      user = plainToClass(
        userInfoDto,
        await this.prisma.user.findFirst({
          where: { id },
          select: {
            id: true,
            email: true,
            fullName: true,
            avatar: true,
            role: true,
            createdAt: true,
          },
        })
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
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

import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { AuthUserResponseDto } from '@/auth/dto/auth-user.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { VerificationDto } from '@/redis/redis.dto';
import { RedisService } from '@/redis/redis.service';

import { verifyUserCommand } from '../impl/verifyUser.command';

@Injectable()
@CommandHandler(verifyUserCommand)
export class verifyUserHandler implements ICommandHandler<
  verifyUserCommand,
  AuthUserResponseDto
> {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly redis: RedisService
  ) {}

  async execute(command: verifyUserCommand): Promise<AuthUserResponseDto> {
    const token = command.dto.verificationCode;

    console.log(1);

    const { id, tries }: VerificationDto = await this.redis.hGetAll(
      `user-verify:${token}`
    );

    console.log(command, id, tries);

    if (!id || !tries) {
      if (tries === 5) {
        await this.redis.del(`user-verify:${token}`);
      } else {
        this.redis.hIncrBy(`user-verify:${token}`, 'tries', 1);
      }
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        password: true,
        fullName: true,
        avatar: true,
        role: true,
        createdAt: true,
        emailVerified: true,
      },
    });

    if (!user) {
      throw new Error('Invalid or expired token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    await this.redis.del(`user-verify:${token}`);

    return {
      message: 'User verified successfully',
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      },
      timestamp: new Date().getTime(),
    };
  }
}

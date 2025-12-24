import { BadRequestException, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { VerifiedUserResponseDto } from '@/auth/dto/auth-user.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { VerificationDto } from '@/redis/redis.dto';
import { RedisService } from '@/redis/redis.service';

import { verifyUserCommand } from '../impl/verify-user.command';

@Injectable()
@CommandHandler(verifyUserCommand)
export class verifyUserHandler implements ICommandHandler<
  verifyUserCommand,
  VerifiedUserResponseDto
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  async execute(command: verifyUserCommand): Promise<VerifiedUserResponseDto> {
    const token = command.dto.verificationCode;

    const { id, tries }: VerificationDto = await this.redis.hGetAll(
      `user-verify:${token}`
    );

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
      throw new BadRequestException('User not found');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    await this.redis.del(`user-verify:${token}`);

    return {
      message: 'User verified successfully',
      data: null,
      timestamp: new Date().getTime(),
    };
  }
}

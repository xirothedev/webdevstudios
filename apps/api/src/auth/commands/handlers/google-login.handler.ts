import { BadRequestException, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PrismaService } from '@/prisma/prisma.service';

import { AuthUserResponseDto } from '../../dto/auth-user.dto';
import { GoogleLoginCommand } from '../impl/google-login.command';
@Injectable()
@CommandHandler(GoogleLoginCommand)
export class GoogleLoginHandler implements ICommandHandler<
  GoogleLoginCommand,
  AuthUserResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: GoogleLoginCommand): Promise<AuthUserResponseDto> {
    const { socialUser } = command;

    if (!socialUser.email) {
      throw new BadRequestException('Email is required');
    }

    if (!socialUser.id) {
      throw new BadRequestException('Google user ID is required');
    }

    let user = await this.prisma.user.findUnique({
      where: { email: socialUser.email },
      include: {
        externalAccounts: {
          where: {
            provider: 'GOOGLE',
            providerId: socialUser.id,
          },
        },
      },
    });

    if (!user) {
      // Create new user with external account
      const newUser = await this.prisma.user.create({
        data: {
          email: socialUser.email,
          fullName: socialUser.fullName ?? undefined,
          avatar: socialUser.avatar ?? undefined,
          role: 'CUSTOMER',
          emailVerified: true,
          externalAccounts: {
            create: {
              provider: 'GOOGLE',
              providerId: socialUser.id,
              providerEmail: socialUser.email,
            },
          },
        },
        include: {
          externalAccounts: true,
        },
      });
      user = newUser;
    } else {
      // User exists, check if external account exists
      if (user.externalAccounts.length === 0) {
        // User exists but doesn't have Google external account, create it
        await this.prisma.externalAccount.create({
          data: {
            userId: user.id,
            provider: 'GOOGLE',
            providerId: socialUser.id,
            providerEmail: socialUser.email,
          },
        });
      }
    }

    if (!user) {
      throw new BadRequestException('Failed to create or retrieve user');
    }

    return {
      message: 'Login successful',
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      },
      timestamp: Date.now(),
    };
  }
}

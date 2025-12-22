import {
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as argon2 from 'argon2';

import { PrismaService } from '@/prisma/prisma.service';

import { AuthUserResponseDto } from '../../dto/auth-user.dto';
import { LoginCommand } from '../impl/login.command';
@Injectable()
@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<
  LoginCommand,
  AuthUserResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: LoginCommand): Promise<AuthUserResponseDto> {
    const { email, password } = command.dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
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
      throw new NotFoundException('User not found');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    if (!user.password) {
      throw new MethodNotAllowedException('Passwordless login is not allowed');
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
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

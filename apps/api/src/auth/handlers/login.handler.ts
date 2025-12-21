import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { PrismaService } from '@/prisma/prisma.service';

import { LoginCommand } from '../commands/login.command';
import { AuthUserDto } from '../dto/auth-user.dto';

@Injectable()
@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<
  LoginCommand,
  AuthUserDto
> {
  constructor(
    private readonly prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService
  ) {}

  async execute(command: LoginCommand) {
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
      },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // rely on JwtModule configuration for secret and options
    return {
      token: this.jwt.sign(
        {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatar: user.avatar,
          role: user.role,
          createdAt: user.createdAt,
        },
        { secret: this.config.getOrThrow<string>('JWT_SECRET_KEY') }
      ),
    };
  }
}

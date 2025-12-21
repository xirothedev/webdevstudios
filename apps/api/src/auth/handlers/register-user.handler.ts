import { ConflictException, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { PrismaService } from '@/prisma/prisma.service';

import { RegisterUserCommand } from '../commands/register-user.command';
import { AuthUserDto } from '../dto/auth-user.dto';

@Injectable()
@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<
  RegisterUserCommand,
  AuthUserDto
> {
  constructor(
    private readonly prisma: PrismaService,
    private jwt: JwtService
  ) {}

  async execute(command: RegisterUserCommand): Promise<AuthUserDto> {
    const { email, password, fullName, phone } = command.dto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await argon2.hash(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phone,
      },
    });

    // sign uses JwtModule configuration (secret, expiresIn)
    return {
      token: this.jwt.sign({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      }),
    };
  }
}

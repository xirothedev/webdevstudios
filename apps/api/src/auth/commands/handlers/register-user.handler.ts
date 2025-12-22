import { ConflictException, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { hash } from 'argon2';

import { PrismaService } from '@/prisma/prisma.service';

import { AuthUserResponseDto } from '../../dto/auth-user.dto';
import { RegisterUserCommand } from '../impl/register-user.command';

@Injectable()
@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<
  RegisterUserCommand,
  AuthUserResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RegisterUserCommand): Promise<AuthUserResponseDto> {
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

    const hashedPassword = await hash(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phone,
      },
    });

    return {
      message: 'User registered successfully',
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      },
      timestamp: Date.now(),
      '@next': 'Verify your email',
    };
  }
}

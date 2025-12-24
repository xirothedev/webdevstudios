import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { hash } from 'argon2';
import { randomBytes } from 'crypto';

import { MailService } from '@/mail/mail.service';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';

import { AuthUserResponseDto } from '../../dto/auth-user.dto';
import { RegisterUserCommand } from '../impl/register-user.command';

@Injectable()
@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<
  RegisterUserCommand,
  AuthUserResponseDto
> {
  private readonly logger = new Logger(RegisterUserHandler.name);
  constructor(
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  async execute(command: RegisterUserCommand): Promise<AuthUserResponseDto> {
    const { email, password } = command.dto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        role: true,
        createdAt: true,
        emailVerified: true,
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
      },
    });

    const hashedToken = await hash(randomBytes(32).toString('hex'));

    await this.redis.hSet(`user-verify:${hashedToken}`, {
      id: user.id,
      tries: 0,
    });

    try {
      await this.mailService.sendVerificationEmail(user.email, hashedToken);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Failed to send verification email'
      );
    }

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

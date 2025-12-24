import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailerService } from '@nestjs-modules/mailer';
import { hash } from 'argon2';
import * as crypto from 'crypto';

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
  constructor(
    private readonly mailer: MailerService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService
  ) {}

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
        emailVerified: true,
      },
    });

    console.log(existingUser);

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

    const hashedToken = await hash(crypto.randomBytes(32).toString('hex'));
    console.log('token', hashedToken);

    await this.redis.hSet(`user-verify:${hashedToken}`, {
      id: user.id,
      tries: 0,
    });

    // use node mailer to send verification link to user email with the token
    await this.mailer.sendMail({
      to: user.email,
      subject: 'Webdev Studio - Verify your email',
      text:
        'Press the link below to verify your email: \n' +
        `${this.config.get<string>('FRONTEND_URL', `http://localhost:${this.config.getOrThrow<string>('PORT', '3000')}`)}/verify?token=${encodeURIComponent(hashedToken)}`, // plaintext body
      html: `<b>Press the link below to verify your email: \n <a href="${this.config.get<string>('FRONTEND_URL', `http://localhost:${this.config.getOrThrow<string>('PORT', '3000')}`)}/verify?token=${encodeURIComponent(hashedToken)}">Verify Email</a></b>`, // HTML body content
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

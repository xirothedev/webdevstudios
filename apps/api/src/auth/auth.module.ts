import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer/dist/mailer.module';
import type { StringValue } from 'ms';

import { RedisModule } from '@/redis/redis.module';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginHandler } from './commands/handlers/login.handler';
import { RegisterUserHandler } from './commands/handlers/register-user.handler';
import { verifyUserHandler } from './commands/handlers/verifyUser.handler';
import { GetProfileHandler } from './queries/handlers/get-profile.handler';
import { GetProfileByTokenHandler } from './queries/handlers/getProfileByToken.handler';
import { JwtStrategy } from './strategies/jwt.strategy';

const commandHandlers = [RegisterUserHandler, LoginHandler, verifyUserHandler];
const queryHandlers = [GetProfileHandler, GetProfileByTokenHandler];

@Module({
  imports: [
    CqrsModule,
    PrismaModule,
    ConfigModule,
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET_KEY'),
        signOptions: {
          expiresIn: configService.get<StringValue>('JWT_EXPIRES_IN', '10m'),
        },
      }),
    }),

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false, // true for 465
          auth: {
            user: config.getOrThrow<string>('MAIL_USER'),
            pass: config.getOrThrow<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"My App" <${config.get<string>('MAIL_USER')}>`,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [...commandHandlers, ...queryHandlers, JwtStrategy, AuthService],
})
export class AuthModule {}

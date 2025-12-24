import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';

import { SessionSerializer } from '@/common/utils/session.serializer';
import { MailModule } from '@/mail/mail.module';
import { RedisModule } from '@/redis/redis.module';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleLoginHandler } from './commands/handlers/google-login.handler';
import { LoginHandler } from './commands/handlers/login.handler';
import { RegisterUserHandler } from './commands/handlers/register-user.handler';
import { verifyUserHandler } from './commands/handlers/verify-user.handler';
import { GetProfileHandler } from './queries/handlers/get-profile.handler';
import { GetProfileByTokenHandler } from './queries/handlers/getProfileByToken.handler';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

const commandHandlers = [
  RegisterUserHandler,
  LoginHandler,
  verifyUserHandler,
  GoogleLoginHandler,
];
const queryHandlers = [GetProfileHandler, GetProfileByTokenHandler];

@Module({
  imports: [
    CqrsModule,
    PrismaModule,
    ConfigModule,
    RedisModule,
    JwtModule,
    HttpModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    JwtStrategy,
    AuthService,
    GoogleStrategy,
    SessionSerializer,
  ],
})
export class AuthModule {}

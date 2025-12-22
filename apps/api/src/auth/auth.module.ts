import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginHandler } from './commands/handlers/login.handler';
import { RegisterUserHandler } from './commands/handlers/register-user.handler';
import { GetProfileHandler } from './queries/handlers/get-profile.handler';
import { GetProfileByTokenHandler } from './queries/handlers/getProfileByToken.handler';
import { JwtStrategy } from './strategies/jwt.strategy';

const commandHandlers = [RegisterUserHandler, LoginHandler];
const queryHandlers = [GetProfileHandler, GetProfileByTokenHandler];

@Module({
  imports: [
    CqrsModule,
    PrismaModule,
    ConfigModule,
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
  ],
  controllers: [AuthController],
  providers: [...commandHandlers, ...queryHandlers, JwtStrategy, AuthService],
})
export class AuthModule {}

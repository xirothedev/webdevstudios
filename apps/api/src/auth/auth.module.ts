import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { GetProfileHandler } from './handlers/get-profile.handler';
import { GetProfileByTokenHandler } from './handlers/getProfileByToken.handler';
import { LoginHandler } from './handlers/login.handler';
import { RegisterUserHandler } from './handlers/register-user.handler';
import { GetUserTokenMiddleware } from './middlewares/getUserToken.middleware';
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
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '10m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [...commandHandlers, ...queryHandlers, JwtStrategy],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GetUserTokenMiddleware).forRoutes('auth/profile/me');
  }
}

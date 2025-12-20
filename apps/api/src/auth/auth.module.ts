import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { GetProfileHandler } from './handlers/get-profile.handler';
import { LoginHandler } from './handlers/login.handler';
import { RegisterUserHandler } from './handlers/register-user.handler';

const commandHandlers = [RegisterUserHandler, LoginHandler];
const queryHandlers = [GetProfileHandler];

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [AuthController],
  providers: [...commandHandlers, ...queryHandlers],
})
export class AuthModule {}

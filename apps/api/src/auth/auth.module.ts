/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { StringValue } from 'ms';

import { MailModule } from '../mail/mail.module';
// Controller
import { AuthController } from './auth.controller';
// Commands
import { Enable2FAHandler } from './commands/enable-2fa';
import { LoginHandler } from './commands/login';
import { LogoutHandler } from './commands/logout';
import { RefreshTokenHandler } from './commands/refresh-token';
import { RegisterHandler } from './commands/register';
import { RequestPasswordResetHandler } from './commands/request-password-reset';
import { ResetPasswordHandler } from './commands/reset-password';
import { Verify2FAHandler } from './commands/verify-2fa';
import { VerifyEmailHandler } from './commands/verify-email';
// Guards
import { GitHubOAuthGuard, GoogleOAuthGuard, MfaGuard } from './guards';
import {
  SessionRepository,
  TokenService,
  TokenStorageService,
  TotpService,
  UserRepository,
} from './infrastructure';
// Queries
import { GetCurrentUserHandler } from './queries/get-current-user';
import { GetSessionsHandler } from './queries/get-sessions';
import { OAuthService, OAuthRedirectService } from './services';
// Services
// Strategies
import { GitHubStrategy, GoogleStrategy, JwtStrategy } from './strategies';

const CommandHandlers = [
  RegisterHandler,
  LoginHandler,
  VerifyEmailHandler,
  Enable2FAHandler,
  Verify2FAHandler,
  RequestPasswordResetHandler,
  ResetPasswordHandler,
  RefreshTokenHandler,
  LogoutHandler,
];

const QueryHandlers = [GetCurrentUserHandler, GetSessionsHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET_KEY'),
        signOptions: {
          expiresIn: configService.get<StringValue>('JWT_ACCESS_TOKEN_EXPIRES_IN', '3600'),
        },
      }),
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    // Infrastructure
    UserRepository,
    SessionRepository,
    TokenService,
    TokenStorageService,
    TotpService,
    // Strategies
    JwtStrategy,
    GoogleStrategy,
    GitHubStrategy,
    // Guards
    GoogleOAuthGuard,
    GitHubOAuthGuard,
    MfaGuard,
    // Services
    OAuthService,
    OAuthRedirectService,
    // Command Handlers
    ...CommandHandlers,
    // Query Handlers
    ...QueryHandlers,
  ],
  exports: [UserRepository, SessionRepository, TokenService, TotpService],
})
export class AuthModule {}

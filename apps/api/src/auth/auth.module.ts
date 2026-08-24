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
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { StringValue } from 'ms';

import { MailModule } from '../mail/mail.module';
// Controller
import { AuthController } from './auth.controller';
// Guards
import { GitHubOAuthGuard, GoogleOAuthGuard, MfaGuard } from './guards';
// Infrastructure
import { TokenService, TokenStorageService, TotpService } from './infrastructure';
// Repository
import { SessionRepo } from './repo';
// Services
import { AuthService, OAuthService, OAuthRedirectService } from './services';
// Strategies
import { GitHubStrategy, GoogleStrategy, JwtStrategy } from './strategies';
// Users module (UserRepo)
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule,
    UsersModule,
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
    // Repository
    SessionRepo,
    // Infrastructure
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
    AuthService,
    OAuthService,
    OAuthRedirectService,
  ],
  exports: [SessionRepo, TokenService, TotpService],
})
export class AuthModule {}

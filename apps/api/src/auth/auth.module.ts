import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { StringValue } from 'ms';

import { MailModule } from '@/mail/mail.module';
import { PrismaModule } from '@/prisma/prisma.module';

// Controller
import { AuthController } from './auth.controller';
// Commands
import { Enable2FAHandler } from './commands/enable-2fa/enable-2fa.handler';
import { LoginHandler } from './commands/login/login.handler';
import { LogoutHandler } from './commands/logout/logout.handler';
import { RefreshTokenHandler } from './commands/refresh-token/refresh-token.handler';
import { RegisterHandler } from './commands/register/register.handler';
import { RequestPasswordResetHandler } from './commands/request-password-reset/request-password-reset.handler';
import { ResetPasswordHandler } from './commands/reset-password/reset-password.handler';
import { Verify2FAHandler } from './commands/verify-2fa/verify-2fa.handler';
import { VerifyEmailHandler } from './commands/verify-email/verify-email.handler';
// Guards
import { GitHubOAuthGuard } from './guards/github-oauth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { MfaGuard } from './guards/mfa.guard';
import { SessionRepository } from './infrastructure/session.repository';
import { TokenService } from './infrastructure/token.service';
import { TokenStorageService } from './infrastructure/token-storage.service';
import { TotpService } from './infrastructure/totp.service';
// Infrastructure
import { UserRepository } from './infrastructure/user.repository';
// Queries
import { GetCurrentUserHandler } from './queries/get-current-user/get-current-user.handler';
import { GetSessionsHandler } from './queries/get-sessions/get-sessions.handler';
// Services
import { OAuthService } from './services/oauth.service';
// Strategies
import { GitHubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

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
          expiresIn: configService.get<StringValue>(
            'JWT_ACCESS_TOKEN_EXPIRES_IN',
            '3600'
          ),
        },
      }),
    }),
    PrismaModule,
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
    // Command Handlers
    ...CommandHandlers,
    // Query Handlers
    ...QueryHandlers,
  ],
  exports: [UserRepository, SessionRepository, TokenService, TotpService],
})
export class AuthModule {}

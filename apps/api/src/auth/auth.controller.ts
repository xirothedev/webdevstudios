import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';

import { Public } from '@/common/decorators/public.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt.guard';

// Commands
import { Enable2FACommand } from './commands/enable-2fa/enable-2fa.command';
import { LoginCommand } from './commands/login/login.command';
import { LogoutCommand } from './commands/logout/logout.command';
import { OAuthCallbackCommand } from './commands/oauth-callback/oauth-callback.command';
import { RefreshTokenCommand } from './commands/refresh-token/refresh-token.command';
import { RegisterCommand } from './commands/register/register.command';
import { RequestPasswordResetCommand } from './commands/request-password-reset/request-password-reset.command';
import { ResetPasswordCommand } from './commands/reset-password/reset-password.command';
import { Verify2FACommand } from './commands/verify-2fa/verify-2fa.command';
import { VerifyEmailCommand } from './commands/verify-email/verify-email.command';
import { CurrentUser } from './decorators/current-user.decorator';
// DTOs
import { LoginDto } from './dtos/login.dto';
import { OAuthCallbackDto } from './dtos/oauth-callback.dto';
import { RegisterDto } from './dtos/register.dto';
import { RequestPasswordResetDto } from './dtos/request-password-reset.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { Verify2FADto } from './dtos/verify-2fa.dto';
// Queries
import { GetCurrentUserQuery } from './queries/get-current-user/get-current-user.query';
import { GetSessionsQuery } from './queries/get-sessions/get-sessions.query';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.commandBus.execute(
      new RegisterCommand(dto.email, dto.password, dto.fullName, dto.phone)
    );
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    return this.commandBus.execute(
      new LoginCommand(
        dto.email,
        dto.password,
        dto.rememberMe,
        ipAddress,
        userAgent
      )
    );
  }

  @Public()
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.commandBus.execute(new VerifyEmailCommand(token));
  }

  @Public()
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.commandBus.execute(new RefreshTokenCommand(refreshToken));
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: { id: string },
    @Body('sessionId') sessionId?: string
  ) {
    return this.commandBus.execute(new LogoutCommand(user.id, sessionId));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: { id: string }) {
    return this.queryBus.execute(new GetCurrentUserQuery(user.id));
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getSessions(@CurrentUser() user: { id: string }) {
    return this.queryBus.execute(new GetSessionsQuery(user.id));
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  async enable2FA(@CurrentUser() user: { id: string }) {
    return this.commandBus.execute(new Enable2FACommand(user.id));
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  async verify2FA(
    @Body() dto: Verify2FADto,
    @CurrentUser() user: { id: string },
    @Req() req: Request
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    return this.commandBus.execute(
      new Verify2FACommand(
        user.id,
        dto.code,
        dto.sessionId,
        ipAddress,
        userAgent
      )
    );
  }

  @Public()
  @Get('oauth/google')
  async initiateGoogleOAuth() {
    // This will be handled by Passport strategy
    // Return OAuth URL or redirect
    return { message: 'Redirect to Google OAuth' };
  }

  @Public()
  @Get('oauth/github')
  async initiateGitHubOAuth() {
    // This will be handled by Passport strategy
    // Return OAuth URL or redirect
    return { message: 'Redirect to GitHub OAuth' };
  }

  @Public()
  @Post('oauth/callback')
  async oauthCallback(@Body() dto: OAuthCallbackDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    return this.commandBus.execute(
      new OAuthCallbackCommand(
        dto.provider,
        dto.code,
        dto.state,
        ipAddress,
        userAgent
      )
    );
  }

  @Public()
  @Post('password/reset-request')
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.commandBus.execute(new RequestPasswordResetCommand(dto.email));
  }

  @Public()
  @Post('password/reset')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.commandBus.execute(
      new ResetPasswordCommand(dto.token, dto.newPassword)
    );
  }
}

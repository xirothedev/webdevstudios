import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { Public } from '@/common/decorators/public.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt.guard';

// Commands
import { Enable2FACommand } from './commands/enable-2fa/enable-2fa.command';
import { LoginCommand } from './commands/login/login.command';
import { LogoutCommand } from './commands/logout/logout.command';
import { RefreshTokenCommand } from './commands/refresh-token/refresh-token.command';
import { RegisterCommand } from './commands/register/register.command';
import { RequestPasswordResetCommand } from './commands/request-password-reset/request-password-reset.command';
import { ResetPasswordCommand } from './commands/reset-password/reset-password.command';
import { Verify2FACommand } from './commands/verify-2fa/verify-2fa.command';
import { VerifyEmailCommand } from './commands/verify-email/verify-email.command';
import { CurrentUser } from './decorators/current-user.decorator';
// DTOs
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { RequestPasswordResetDto } from './dtos/request-password-reset.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import {
  Enable2FAResponseDto,
  LoginResponseDto,
  OAuthCallbackResponseDto,
  RefreshTokenResponseDto,
  RegisterResponseDto,
  SessionResponseDto,
  SuccessResponseDto,
  UserResponseDto,
  Verify2FAResponseDto,
} from './dtos/responses.dto';
import { Verify2FADto } from './dtos/verify-2fa.dto';
import { GitHubOAuthGuard } from './guards/github-oauth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
// Queries
import { GetCurrentUserQuery } from './queries/get-current-user/get-current-user.query';
import { GetSessionsQuery } from './queries/get-sessions/get-sessions.query';
import { OAuthService } from './services/oauth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly oauthService: OAuthService
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account and send email verification',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async register(@Body() dto: RegisterDto) {
    return this.commandBus.execute(
      new RegisterCommand(dto.email, dto.password, dto.fullName, dto.phone)
    );
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description:
      'Authenticate user with email and password. Returns tokens or 2FA challenge if enabled.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 400,
    description: 'Email not verified',
  })
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
  @ApiOperation({
    summary: 'Verify email address',
    description: 'Verify user email using token from verification email',
  })
  @ApiQuery({
    name: 'token',
    description: 'Email verification token',
    example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Invalid or expired verification token',
  })
  @ApiResponse({
    status: 400,
    description: 'Email is already verified',
  })
  async verifyEmail(@Query('token') token: string) {
    return this.commandBus.execute(new VerifyEmailCommand(token));
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get new access and refresh tokens using refresh token',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          description: 'JWT refresh token',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['refreshToken'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.commandBus.execute(new RefreshTokenCommand(refreshToken));
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout user',
    description: 'Revoke current session or all sessions',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description:
            'Specific session ID to revoke (optional, revokes all if not provided)',
          example: 'clx1234567890',
        },
      },
    },
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async logout(
    @CurrentUser() user: { id: string },
    @Body('sessionId') sessionId?: string
  ) {
    return this.commandBus.execute(new LogoutCommand(user.id, sessionId));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user',
    description: 'Get information about the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User information',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getCurrentUser(@CurrentUser() user: { id: string }) {
    return this.queryBus.execute(new GetCurrentUserQuery(user.id));
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user sessions',
    description: 'Get all active sessions for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active sessions',
    type: [SessionResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getSessions(@CurrentUser() user: { id: string }) {
    return this.queryBus.execute(new GetSessionsQuery(user.id));
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enable 2FA',
    description: 'Enable two-factor authentication and generate QR code',
  })
  @ApiResponse({
    status: 200,
    description: '2FA enabled, QR code and backup codes returned',
    type: Enable2FAResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '2FA is already enabled',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async enable2FA(@CurrentUser() user: { id: string }) {
    return this.commandBus.execute(new Enable2FACommand(user.id));
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify 2FA code',
    description: 'Verify 2FA code for login or setup flow',
  })
  @ApiBody({ type: Verify2FADto })
  @ApiResponse({
    status: 200,
    description: '2FA verified successfully',
    type: Verify2FAResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid 2FA code or unauthorized',
  })
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
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({
    summary: 'Initiate Google OAuth',
    description: 'Redirects to Google OAuth consent screen',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Google OAuth',
  })
  async initiateGoogleOAuth() {
    // Passport will redirect to Google OAuth
  }

  @Public()
  @Get('oauth/google/callback')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({
    summary: 'Google OAuth callback',
    description: 'Handles Google OAuth callback and returns tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'OAuth authentication successful',
    type: OAuthCallbackResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'OAuth authentication failed',
  })
  async googleCallback(@Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');
    const oauthUser = req.user as {
      provider: string;
      providerId: string;
      email: string;
      name?: string;
      picture?: string;
    };

    return this.oauthService.handleOAuthCallback(
      oauthUser as any,
      ipAddress,
      userAgent
    );
  }

  @Public()
  @Get('oauth/github')
  @UseGuards(GitHubOAuthGuard)
  @ApiOperation({
    summary: 'Initiate GitHub OAuth',
    description: 'Redirects to GitHub OAuth consent screen',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to GitHub OAuth',
  })
  async initiateGitHubOAuth() {
    // Passport will redirect to GitHub OAuth
  }

  @Public()
  @Get('oauth/github/callback')
  @UseGuards(GitHubOAuthGuard)
  @ApiOperation({
    summary: 'GitHub OAuth callback',
    description: 'Handles GitHub OAuth callback and returns tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'OAuth authentication successful',
    type: OAuthCallbackResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'OAuth authentication failed',
  })
  async githubCallback(@Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');
    const oauthUser = req.user as {
      provider: string;
      providerId: string;
      email: string;
      name?: string;
      picture?: string;
    };

    return this.oauthService.handleOAuthCallback(
      oauthUser as any,
      ipAddress,
      userAgent
    );
  }

  @Public()
  @Post('password/reset-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Send password reset email to user',
  })
  @ApiBody({ type: RequestPasswordResetDto })
  @ApiResponse({
    status: 200,
    description:
      'Password reset email sent (always returns success for security)',
    type: SuccessResponseDto,
  })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.commandBus.execute(new RequestPasswordResetCommand(dto.email));
  }

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset user password using token from email',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Invalid or expired reset token',
  })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.commandBus.execute(
      new ResetPasswordCommand(dto.token, dto.newPassword)
    );
  }
}

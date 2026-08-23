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

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';

import {
  Public,
  Throttle2FA,
  ThrottleOAuth,
  ThrottlePasswordReset,
  ThrottleRefresh,
  ThrottleStrict,
} from '@/common/decorators';
import { JwtAuthGuard } from '@/common/guards';
import { CurrentUser } from './decorators/current-user.decorator';
// DTOs
import {
  Enable2FAResponseDto,
  LoginDto,
  LoginResponseDto,
  OAuthCallbackResponseDto,
  RefreshTokenResponseDto,
  RegisterDto,
  RegisterResponseDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  SessionResponseDto,
  SuccessResponseDto,
  UserResponseDto,
  Verify2FADto,
  Verify2FAResponseDto,
  VerifyEmailDto,
} from './dto';
import { GitHubOAuthGuard, GoogleOAuthGuard } from './guards';
import { AuthCookies } from './services/auth-cookies.service';
import { AuthService } from './services/auth.service';
import { OAuthService, OAuthRedirectService } from './services';
import { OAuthProfile } from './strategies';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly oauthService: OAuthService,
    private readonly oauthRedirectService: OAuthRedirectService,
    private readonly authCookies: AuthCookies,
  ) {}

  @Public()
  @ThrottleStrict()
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
    return this.authService.register(dto);
  }

  @Public()
  @ThrottleStrict()
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
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    const result = await this.authService.login(dto, ipAddress, userAgent);

    // Set cookies if login successful (not 2FA required)
    if (!result.requires2FA && result.accessToken && result.refreshToken) {
      this.authCookies.set(res, result, result.ttlSeconds!);
    }

    return result;
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
    type: String,
    required: true,
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
    description: 'Email is already verified or invalid token',
  })
  async verifyEmail(@Query() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Public()
  @ThrottleRefresh()
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
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body('refreshToken') refreshToken?: string,
  ) {
    // Get refresh token from cookie if not provided in body
    const token = refreshToken || req.cookies?.refresh_token;
    if (!token) {
      throw new BadRequestException('Refresh token is required');
    }

    const result = await this.authService.refresh(token);

    this.authCookies.set(res, result, result.ttlSeconds);

    return result;
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
          description: 'Specific session ID to revoke (optional, revokes all if not provided)',
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
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body('sessionId') sessionId?: string,
  ) {
    const result = await this.authService.logout(user.id, sessionId);

    this.authCookies.clear(res);

    return result;
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
    return this.authService.getCurrentUser(user.id);
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
    return this.authService.getSessions(user.id);
  }

  @Throttle2FA()
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
    return this.authService.enable2FA(user.id);
  }

  @Throttle2FA()
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
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    const result = await this.authService.verify2FA(user.id, dto, ipAddress, userAgent);

    // Set cookies if login flow (tokens returned)
    if (result.accessToken && result.refreshToken) {
      this.authCookies.set(
        res,
        { accessToken: result.accessToken, refreshToken: result.refreshToken },
        result.ttlSeconds!,
      );
    }

    return result;
  }

  @Public()
  @ThrottleOAuth()
  @Get('oauth/google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({
    summary: 'Initiate Google OAuth',
    description: 'Redirects to Google OAuth consent screen',
  })
  @ApiQuery({
    name: 'redirect_url',
    required: false,
    description: 'Frontend URL to redirect after OAuth success',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Google OAuth',
  })
  async initiateGoogleOAuth(@Query('redirect_url') redirectUrl?: string, @Req() req?: Request) {
    // Store redirect_url in session to retrieve in callback
    if (redirectUrl && req?.session) {
      req.session.oauthRedirectUrl = redirectUrl;
      // Save session before redirect
      await new Promise<void>((resolve, reject) => {
        req.session?.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    // Passport will redirect to Google OAuth
  }

  @Public()
  @ThrottleOAuth()
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
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    // Get redirect_url from session (stored during initiation)
    const redirectUrl = req.session?.oauthRedirectUrl;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');
    const oauthUser = req.user as OAuthProfile;

    try {
      const result = await this.oauthService.handleOAuthCallback(oauthUser, ipAddress, userAgent);

      // Use service to handle success redirect
      this.oauthRedirectService.handleSuccess(res, result, redirectUrl);
    } catch (error) {
      // Use service to handle error redirect
      this.oauthRedirectService.handleError(res, error, redirectUrl);
    }
  }

  @Public()
  @ThrottleOAuth()
  @Get('oauth/github')
  @UseGuards(GitHubOAuthGuard)
  @ApiOperation({
    summary: 'Initiate GitHub OAuth',
    description: 'Redirects to GitHub OAuth consent screen',
  })
  @ApiQuery({
    name: 'redirect_url',
    required: false,
    description: 'Frontend URL to redirect after OAuth success',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to GitHub OAuth',
  })
  async initiateGitHubOAuth(@Query('redirect_url') redirectUrl?: string, @Req() req?: Request) {
    // Store redirect_url in session to retrieve in callback
    if (redirectUrl && req?.session) {
      req.session.oauthRedirectUrl = redirectUrl;
      // Save session before redirect
      await new Promise<void>((resolve, reject) => {
        req.session?.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    // Passport will redirect to GitHub OAuth
  }

  @Public()
  @ThrottleOAuth()
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
  async githubCallback(@Req() req: Request, @Res() res: Response) {
    // Get redirect_url from session (stored during initiation)
    const redirectUrl = req.session?.oauthRedirectUrl;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');
    const oauthUser = req.user as OAuthProfile;

    try {
      const result = await this.oauthService.handleOAuthCallback(oauthUser, ipAddress, userAgent);

      // Use service to handle success redirect
      this.oauthRedirectService.handleSuccess(res, result, redirectUrl);
    } catch (error) {
      // Use service to handle error redirect
      this.oauthRedirectService.handleError(res, error, redirectUrl);
    }
  }

  @Public()
  @ThrottlePasswordReset()
  @Post('password/reset-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Send password reset email to user',
  })
  @ApiBody({ type: RequestPasswordResetDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent (always returns success for security)',
    type: SuccessResponseDto,
  })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @Public()
  @ThrottlePasswordReset()
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
    return this.authService.resetPassword(dto);
  }
}

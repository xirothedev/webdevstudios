import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

interface OAuthCallbackResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    emailVerified: boolean;
  };
}

@Injectable()
export class OAuthRedirectService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get frontend URL from config
   */
  private getFrontendUrl(): string {
    return this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000'
    );
  }

  /**
   * Set authentication cookies
   */
  setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string
  ): void {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }

  /**
   * Build frontend callback URL with optional redirect_url
   */
  buildCallbackUrl(redirectUrl?: string): string {
    const frontendUrl = this.getFrontendUrl();
    const callbackUrl = new URL('/auth/oauth/callback', frontendUrl);

    if (redirectUrl) {
      callbackUrl.searchParams.set('redirect_url', redirectUrl);
    }

    return callbackUrl.toString();
  }

  /**
   * Build error callback URL
   */
  buildErrorCallbackUrl(
    error: string,
    errorDescription: string,
    redirectUrl?: string
  ): string {
    const frontendUrl = this.getFrontendUrl();
    const callbackUrl = new URL('/auth/oauth/callback', frontendUrl);

    callbackUrl.searchParams.set('error', error);
    callbackUrl.searchParams.set('error_description', errorDescription);

    if (redirectUrl) {
      callbackUrl.searchParams.set('redirect_url', redirectUrl);
    }

    return callbackUrl.toString();
  }

  /**
   * Handle successful OAuth callback
   * Sets cookies and redirects to frontend
   */
  handleSuccess(
    res: Response,
    result: OAuthCallbackResult,
    redirectUrl?: string
  ): void {
    // Set cookies
    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    // Redirect to frontend callback page
    const callbackUrl = this.buildCallbackUrl(redirectUrl);
    res.redirect(callbackUrl);
  }

  /**
   * Handle failed OAuth callback
   * Redirects to frontend with error information
   */
  handleError(
    res: Response,
    error: Error | unknown,
    redirectUrl?: string
  ): void {
    const errorMessage =
      error instanceof Error ? error.message : 'OAuth authentication failed';

    const callbackUrl = this.buildErrorCallbackUrl(
      'oauth_failed',
      errorMessage,
      redirectUrl
    );

    res.redirect(callbackUrl);
  }
}

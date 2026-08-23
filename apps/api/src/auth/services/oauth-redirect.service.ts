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

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

import { AuthCookies } from './auth-cookies.service';

interface OAuthCallbackResult {
  accessToken: string;
  refreshToken: string;
  ttlSeconds: number;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    emailVerified: boolean;
  };
}

@Injectable()
export class OAuthRedirectService {
  constructor(
    private readonly configService: ConfigService,
    private readonly authCookies: AuthCookies,
  ) {}

  /**
   * Get frontend URL from config
   */
  private getFrontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
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
  buildErrorCallbackUrl(error: string, errorDescription: string, redirectUrl?: string): string {
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
  handleSuccess(res: Response, result: OAuthCallbackResult, redirectUrl?: string): void {
    this.authCookies.set(res, result, result.ttlSeconds);

    // Redirect to frontend callback page
    const callbackUrl = this.buildCallbackUrl(redirectUrl);
    res.redirect(callbackUrl);
  }

  /**
   * Handle failed OAuth callback
   * Redirects to frontend with error information
   */
  handleError(res: Response, error: Error | unknown, redirectUrl?: string): void {
    const errorMessage = error instanceof Error ? error.message : 'OAuth authentication failed';

    const callbackUrl = this.buildErrorCallbackUrl('oauth_failed', errorMessage, redirectUrl);

    res.redirect(callbackUrl);
  }
}

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

import { apiClient } from '@/lib/api-client';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  RequestPasswordResetResponse,
  ResetPasswordResponse,
  Session,
  User,
  Verify2FAResponse,
  VerifyEmailResponse,
} from '@/types/auth.types';

export const authApi = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<{ data: RegisterResponse }>(
      '/auth/register',
      data
    );
    return response.data.data;
  },

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<{ data: LoginResponse }>(
      '/auth/login',
      data
    );
    return response.data.data;
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ data: User }>('/auth/me');
    return response.data.data;
  },

  /**
   * Logout user
   */
  async logout(sessionId?: string): Promise<void> {
    await apiClient.post('/auth/logout', { sessionId });
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    const response = await apiClient.get<{ data: VerifyEmailResponse }>(
      '/auth/verify-email',
      {
        params: { token },
      }
    );
    return response.data.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken?: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<{ data: RefreshTokenResponse }>(
      '/auth/refresh',
      refreshToken ? { refreshToken } : {}
    );
    return response.data.data;
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(
    email: string
  ): Promise<RequestPasswordResetResponse> {
    const response = await apiClient.post<{
      data: RequestPasswordResetResponse;
    }>('/auth/password/reset-request', { email });
    return response.data.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<ResetPasswordResponse> {
    const response = await apiClient.post<{ data: ResetPasswordResponse }>(
      '/auth/password/reset',
      { token, newPassword }
    );
    return response.data.data;
  },

  /**
   * Verify 2FA code
   */
  async verify2FA(
    code: string,
    sessionId?: string
  ): Promise<Verify2FAResponse> {
    const response = await apiClient.post<{ data: Verify2FAResponse }>(
      '/auth/2fa/verify',
      { code, sessionId }
    );
    return response.data.data;
  },

  /**
   * Get user sessions
   */
  async getSessions(): Promise<Session[]> {
    const response = await apiClient.get<{ data: Session[] }>('/auth/sessions');
    return response.data.data;
  },
};

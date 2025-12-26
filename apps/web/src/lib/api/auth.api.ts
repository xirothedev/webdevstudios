import { apiClient } from '@/lib/api-client';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  RequestPasswordResetResponse,
  ResetPasswordResponse,
  User,
  Verify2FAResponse,
  VerifyEmailResponse,
} from '@/types/auth.types';

export const authApi = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(
      '/auth/register',
      data
    );
    return response.data;
  },

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
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
    const response = await apiClient.get<VerifyEmailResponse>(
      '/auth/verify-email',
      {
        params: { token },
      }
    );
    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken?: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>(
      '/auth/refresh',
      refreshToken ? { refreshToken } : {}
    );
    return response.data;
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(
    email: string
  ): Promise<RequestPasswordResetResponse> {
    const response = await apiClient.post<RequestPasswordResetResponse>(
      '/auth/password/reset-request',
      { email }
    );
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<ResetPasswordResponse> {
    const response = await apiClient.post<ResetPasswordResponse>(
      '/auth/password/reset',
      { token, newPassword }
    );
    return response.data;
  },

  /**
   * Verify 2FA code
   */
  async verify2FA(
    code: string,
    sessionId?: string
  ): Promise<Verify2FAResponse> {
    const response = await apiClient.post<Verify2FAResponse>(
      '/auth/2fa/verify',
      { code, sessionId }
    );
    return response.data;
  },
};

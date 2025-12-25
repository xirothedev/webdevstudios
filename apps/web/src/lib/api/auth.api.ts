import { apiClient } from '@/lib/api-client';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  User,
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
};

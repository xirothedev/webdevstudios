export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    emailVerified: boolean;
    mfaEnabled: boolean;
  };
  requires2FA?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface RegisterResponse {
  userId: string;
}

export interface VerifyEmailResponse {
  success: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  avatar: string | null;
  role: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type OAuthProvider = 'google' | 'github';

export interface RefreshTokenRequest {
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface RequestPasswordResetResponse {
  success: boolean;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
}

export interface Verify2FARequest {
  code: string;
  sessionId?: string;
}

export interface Verify2FAResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    fullName: string | null;
    emailVerified: boolean;
    mfaEnabled: boolean;
  };
  verified?: boolean;
}

export interface Enable2FAResponse {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

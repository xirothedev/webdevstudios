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

export interface Session {
  id: string;
  device: {
    id: string;
    name: string | null;
    type: string;
    lastSeenAt: Date;
  } | null;
  ipAddress: string | null;
  userAgent: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  createdAt: Date;
  expiresAt: Date;
}

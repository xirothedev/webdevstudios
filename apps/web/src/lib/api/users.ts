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
import type { User } from '@/types/auth.types';

export type UserRole = 'ADMIN' | 'CUSTOMER';

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
}

export interface UpdateProfileResponse {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  avatar: string | null;
  role: UserRole;
  emailVerified: boolean;
  phoneVerified: boolean;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const usersApi = {
  /**
   * Get current user profile
   */
  async getUserProfile(): Promise<User> {
    const response = await apiClient.get<{ data: User }>('/users/me');
    return response.data.data;
  },

  /**
   * Update user profile (fullName, phone)
   */
  async updateProfile(
    data: UpdateProfileRequest
  ): Promise<UpdateProfileResponse> {
    const response = await apiClient.patch<{ data: UpdateProfileResponse }>(
      '/users/profile',
      data
    );
    return response.data.data;
  },

  /**
   * Update user avatar
   */
  async updateAvatar(file: File): Promise<UpdateProfileResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.patch<{ data: UpdateProfileResponse }>(
      '/users/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },
};

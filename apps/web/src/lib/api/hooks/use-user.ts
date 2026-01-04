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

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authKeys } from '@/lib/api/hooks/use-auth';
import { type UpdateProfileRequest, usersApi } from '@/lib/api/users';

// Query Keys
const userKeys = {
  all: ['users'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
};

// Query: Get user profile
export function useUserProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => usersApi.getUserProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

// Mutation: Update profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => usersApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Update both user profile cache and current user cache
      queryClient.setQueryData(userKeys.profile(), updatedUser);
      queryClient.setQueryData(authKeys.currentUser(), updatedUser);
      toast.success('Cập nhật hồ sơ thành công!');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Cập nhật hồ sơ thất bại. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}

// Mutation: Update avatar
export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => usersApi.updateAvatar(file),
    onSuccess: (updatedUser) => {
      // Update both user profile cache and current user cache
      queryClient.setQueryData(userKeys.profile(), updatedUser);
      queryClient.setQueryData(authKeys.currentUser(), updatedUser);
      toast.success('Cập nhật ảnh đại diện thành công!');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Cập nhật ảnh đại diện thất bại. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}

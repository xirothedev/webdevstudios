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

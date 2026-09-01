import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';

import { syncUserCache, userKeys } from '@/lib/auth';
import { type UpdateProfileRequest, usersApi } from '@/lib/api/users';
import { toast } from '@/lib/toast';

// Keys live in the auth module (one user cache story); re-exported for existing call sites.
export { userKeys };

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
      syncUserCache(queryClient, updatedUser);
      toast.success('Cập nhật hồ sơ thành công!');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Cập nhật hồ sơ thất bại. Vui lòng thử lại.';
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
      syncUserCache(queryClient, updatedUser);
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

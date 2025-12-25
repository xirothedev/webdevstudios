'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { authApi } from '@/lib/api/auth.api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '@/types/auth.types';

// Query Keys
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const,
};

// Query: Get current user
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: () => authApi.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

// Mutation: Login
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (response: LoginResponse) => {
      // Check if 2FA is required
      if (response.requires2FA) {
        toast.info('Vui lòng xác thực 2FA để tiếp tục');
        router.push('/auth/2fa');
        return;
      }

      // Invalidate and refetch current user
      await queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
      toast.success('Đăng nhập thành công!');
      router.push('/');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Đăng nhập thất bại. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}

// Mutation: Register
export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: () => {
      toast.success(
        'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.'
      );
      router.push('/auth/login');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Đăng ký thất bại. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}

// Mutation: Logout
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (sessionId?: string) => authApi.logout(sessionId),
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      toast.success('Đã đăng xuất');
      router.push('/auth/login');
    },
    onError: (error: unknown) => {
      // Still clear queries and redirect even on error
      queryClient.clear();
      const errorMessage =
        error instanceof Error ? error.message : 'Đăng xuất thất bại';
      toast.error(errorMessage);
      router.push('/auth/login');
    },
  });
}

// Mutation: Verify Email
export function useVerifyEmail() {
  const router = useRouter();

  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: () => {
      toast.success('Email đã được xác thực thành công!');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Token không hợp lệ hoặc đã hết hạn';
      toast.error(errorMessage);
    },
  });
}

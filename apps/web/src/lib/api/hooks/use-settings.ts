'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authApi } from '@/lib/api/auth.api';

// Query Keys
const settingsKeys = {
  all: ['settings'] as const,
  sessions: () => [...settingsKeys.all, 'sessions'] as const,
};

// Query: Get user sessions
export function useSessions() {
  return useQuery({
    queryKey: settingsKeys.sessions(),
    queryFn: () => authApi.getSessions(),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: false,
  });
}

// Mutation: Revoke session
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId?: string) => authApi.logout(sessionId),
    onSuccess: () => {
      // Invalidate sessions list
      queryClient.invalidateQueries({ queryKey: settingsKeys.sessions() });
      toast.success('Đã đăng xuất phiên làm việc');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Không thể đăng xuất phiên làm việc. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}

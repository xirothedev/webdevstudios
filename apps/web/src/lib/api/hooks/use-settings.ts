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

import { authApi } from '@/lib/api/auth';

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

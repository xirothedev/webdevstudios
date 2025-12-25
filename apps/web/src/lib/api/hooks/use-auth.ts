'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { authApi } from '@/lib/api/auth.api';
import type {
  LoginRequest,
  LoginResponse,
  OAuthProvider,
  RegisterRequest,
} from '@/types/auth.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const FRONTEND_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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
    // Don't refetch on window focus if we're on auth pages
    refetchOnWindowFocus: false,
    // Don't refetch on mount if we're on auth pages
    refetchOnMount: () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        // Skip refetch if on auth pages
        if (path.startsWith('/auth/')) {
          return false;
        }
      }
      return true;
    },
  });
}

// Mutation: Login
export function useLogin(redirectUrl?: string) {
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

      // Redirect to provided URL or home
      const finalRedirectUrl = redirectUrl || '/';
      router.push(finalRedirectUrl);
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
export function useRegister(redirectUrl?: string) {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: () => {
      toast.success(
        'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.'
      );

      // Redirect to provided URL or login page
      const finalRedirectUrl = redirectUrl || '/auth/login';
      router.push(finalRedirectUrl);
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

// Hook: Get redirect URL from query params
export function useRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const getRedirectUrl = (): string => {
    const redirectUrl = searchParams.get('redirect_url');
    if (!redirectUrl) {
      return '/';
    }

    // Validate redirect URL - only allow internal URLs
    try {
      const url = new URL(redirectUrl, FRONTEND_URL);
      const frontendOrigin = new URL(FRONTEND_URL).origin;

      // Only allow same origin redirects
      if (url.origin !== frontendOrigin) {
        return '/';
      }

      return url.pathname + url.search;
    } catch {
      // Invalid URL, default to home
      return '/';
    }
  };

  const redirect = (defaultPath: string = '/') => {
    const redirectUrl = getRedirectUrl();
    router.push(redirectUrl || defaultPath);
  };

  return {
    redirectUrl: getRedirectUrl(),
    redirect,
  };
}

// Hook: OAuth popup flow
export function useOAuth() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(
    null
  );

  const initiateOAuth = (provider: OAuthProvider, redirectUrl?: string) => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    // Build OAuth URL with redirect_url in state if provided
    let oauthUrl = `${API_URL}/auth/oauth/${provider}`;
    if (redirectUrl) {
      const params = new URLSearchParams({
        redirect_url: redirectUrl,
      });
      oauthUrl += `?${params.toString()}`;
    }

    // Calculate popup position (center of screen)
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    // Open popup
    const popup = window.open(
      oauthUrl,
      'oauth-popup',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      toast.error(
        'Không thể mở popup. Vui lòng cho phép popup trong trình duyệt.'
      );
      setIsLoading(false);
      return;
    }

    popupRef.current = popup;

    // Listen for messages from popup
    const messageHandler = (event: MessageEvent) => {
      // Verify origin for security
      const allowedOrigin = new URL(FRONTEND_URL).origin;
      if (event.origin !== allowedOrigin) {
        return;
      }

      if (event.data?.type === 'oauth-success') {
        // OAuth successful
        popupRef.current?.close();
        popupRef.current = null;

        const finalRedirectUrl = event.data.data?.redirectUrl || '/';

        // Invalidate queries to refetch user data
        queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });

        toast.success('Đăng nhập thành công!');

        // Reload page to ensure cookies are available, then redirect
        // Store redirect URL in sessionStorage to use after reload
        if (finalRedirectUrl && finalRedirectUrl !== '/') {
          sessionStorage.setItem('oauth_redirect_url', finalRedirectUrl);
        }

        // Reload page
        window.location.reload();
      } else if (event.data?.type === 'oauth-error') {
        // OAuth failed
        popupRef.current?.close();
        popupRef.current = null;

        const errorMessage =
          event.data.data?.errorDescription ||
          event.data.data?.error ||
          'Đăng nhập thất bại. Vui lòng thử lại.';
        toast.error(errorMessage);
        setIsLoading(false);
      }
    };

    messageHandlerRef.current = messageHandler;
    window.addEventListener('message', messageHandler);

    // Check if popup was closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        setIsLoading(false);
        if (messageHandlerRef.current) {
          window.removeEventListener('message', messageHandlerRef.current);
          messageHandlerRef.current = null;
        }
        popupRef.current = null;
      }
    }, 500);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
      if (messageHandlerRef.current) {
        window.removeEventListener('message', messageHandlerRef.current);
      }
    };
  }, []);

  return {
    initiateOAuth,
    isLoading,
  };
}

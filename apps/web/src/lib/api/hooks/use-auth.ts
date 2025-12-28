'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { authApi } from '@/lib/api/auth';
import { API_URL, SITE_URL } from '@/lib/constants';
import { clearCsrfToken } from '@/lib/csrf';
import type {
  LoginRequest,
  LoginResponse,
  OAuthProvider,
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

// Helper function to get redirect URL from query params
function getRedirectUrlFromQuery(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const redirectUrl = searchParams.get('redirect_url');
  if (!redirectUrl) {
    return null;
  }

  // Validate redirect URL - only allow internal URLs
  try {
    const url = new URL(redirectUrl, SITE_URL);
    const frontendOrigin = new URL(SITE_URL).origin;

    // Only allow same origin redirects
    if (url.origin !== frontendOrigin) {
      return null;
    }

    return url.pathname + url.search;
  } catch {
    // Invalid URL, return null
    return null;
  }
}

// Mutation: Login
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (response: LoginResponse) => {
      // Clear old CSRF token and fetch new one for new session
      clearCsrfToken();

      // Check if 2FA is required
      if (response.requires2FA) {
        toast.info('Vui lòng xác thực 2FA để tiếp tục');
        router.push('/auth/2fa');
        return;
      }

      // Invalidate and refetch current user
      await queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
      toast.success('Đăng nhập thành công!');

      // Get redirect URL from query params only after successful login
      const redirectUrl = getRedirectUrlFromQuery();
      // Redirect to redirectUrl if provided, otherwise redirect to homepage
      router.push(redirectUrl || '/');
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

      // Get redirect URL from query params only after successful register
      const redirectUrl = getRedirectUrlFromQuery();
      // Register always redirects to login for email verification, unless redirect_url is provided
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

  return useMutation({
    mutationFn: (sessionId?: string) => authApi.logout(sessionId),
    onSuccess: () => {
      clearCsrfToken();
      queryClient.clear();
      toast.success('Đã đăng xuất');
      window.location.reload();
    },
    onError: (error: unknown) => {
      // Still clear CSRF token and queries even on error
      clearCsrfToken();
      queryClient.clear();
      const errorMessage =
        error instanceof Error ? error.message : 'Đăng xuất thất bại';
      toast.error(errorMessage);
      window.location.reload();
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

// Mutation: Request Password Reset
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset(email),
    onSuccess: () => {
      toast.success(
        'Vui lòng kiểm tra email để nhận link reset mật khẩu. Nếu không thấy email, vui lòng kiểm tra thư mục spam.'
      );
    },
    onError: (error: unknown) => {
      // Backend always returns success for security, but handle errors just in case
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Không thể gửi email reset mật khẩu. Vui lòng thử lại sau.';
      toast.error(errorMessage);
    },
  });
}

// Mutation: Reset Password
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      authApi.resetPassword(data.token, data.newPassword),
    onSuccess: () => {
      toast.success('Đặt lại mật khẩu thành công!');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Token không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}

// Mutation: Verify 2FA
export function useVerify2FA() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { code: string; sessionId?: string }) =>
      authApi.verify2FA(data.code, data.sessionId),
    onSuccess: async (response) => {
      // If login flow (has tokens), invalidate queries and redirect
      if (response.accessToken && response.refreshToken) {
        await queryClient.invalidateQueries({
          queryKey: authKeys.currentUser(),
        });
        toast.success('Xác thực 2FA thành công!');
        router.push('/');
      } else {
        // Setup flow (just verified)
        toast.success('2FA đã được kích hoạt thành công!');
      }
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Mã xác thực không hợp lệ. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}

// Hook: OAuth popup flow
export function useOAuth() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(
    null
  );

  const initiateOAuth = (provider: OAuthProvider) => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    // Get redirect URL from query params
    const redirectUrl = getRedirectUrlFromQuery();
    const oauthUrl = redirectUrl
      ? `${API_URL}/auth/oauth/${provider}?${new URLSearchParams({ redirect_url: redirectUrl }).toString()}`
      : `${API_URL}/auth/oauth/${provider}`;

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
      const allowedOrigin = new URL(SITE_URL).origin;
      if (event.origin !== allowedOrigin) {
        return;
      }

      if (event.data?.type === 'oauth-success') {
        popupRef.current?.close();
        popupRef.current = null;

        const redirectUrl = event.data.data?.redirectUrl || '/';

        queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
        toast.success('Đăng nhập thành công!');

        sessionStorage.setItem('oauth_redirect_url', redirectUrl);
        window.location.reload();
      } else if (event.data?.type === 'oauth-error') {
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
        }
        messageHandlerRef.current = null;
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

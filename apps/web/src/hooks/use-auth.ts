'use client';

import { useContext } from 'react';

import { AuthContext } from '@/contexts/auth.context';
import {
  useCurrentUser,
  useLogin,
  useLogout,
  useRegister,
  useVerifyEmail,
} from '@/lib/api/hooks/use-auth';

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const verifyEmailMutation = useVerifyEmail();
  const { refetch: refreshUser } = useCurrentUser();

  return {
    ...context,
    // Expose mutations for backward compatibility
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    verifyEmail: verifyEmailMutation.mutateAsync,
    refreshUser: refreshUser,
    // Expose mutation states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isVerifyingEmail: verifyEmailMutation.isPending,
  };
}

'use client';

import { useRouter } from 'next/navigation';
import { createContext, useCallback, useEffect, useState } from 'react';

import { authApi } from '@/lib/api/auth.api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from '@/types/auth.types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<LoginResponse>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication status on mount
  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } catch {
      // Not authenticated - cookies might be expired or invalid
      setUser(null);
    }
  }, []);

  // Load user on mount
  useEffect(() => {
    checkAuth().finally(() => {
      setIsLoading(false);
    });
  }, [checkAuth]);

  const login = useCallback(
    async (data: LoginRequest): Promise<LoginResponse> => {
      const response = await authApi.login(data);

      // If login successful (not 2FA), fetch full user data
      if (!response.requires2FA && response.user) {
        try {
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);
        } catch {
          // Fallback to response user data if getCurrentUser fails
          setUser({
            id: response.user.id,
            email: response.user.email,
            fullName: response.user.fullName,
            phone: null,
            avatar: null,
            role: 'CUSTOMER',
            emailVerified: response.user.emailVerified,
            phoneVerified: false,
            mfaEnabled: response.user.mfaEnabled,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      return response;
    },
    []
  );

  const register = useCallback(
    async (data: RegisterRequest): Promise<RegisterResponse> => {
      const response = await authApi.register(data);
      // Don't set user on register - user needs to verify email first
      return response;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors - still clear local state
    } finally {
      setUser(null);
      router.push('/auth/login');
    }
  }, [router]);

  const verifyEmail = useCallback(async (token: string): Promise<void> => {
    await authApi.verifyEmail(token);
    // Email verification doesn't set user - user needs to login after verification
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    verifyEmail,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };

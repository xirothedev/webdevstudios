'use client';

import { createContext } from 'react';

import { useCurrentUser } from '@/lib/api/hooks/use-auth';

interface AuthContextType {
  user: ReturnType<typeof useCurrentUser>['data'];
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// One user cache story: authKeys.currentUser and userKeys.profile must always agree.
// Every write through this module touches both; consumers may keep using either hook.
import { useQuery, type QueryClient } from '@tanstack/vue-query';

import { authApi } from '@/lib/api/auth';

export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const,
};

export const userKeys = {
  all: ['users'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
};

// Shared options so the router guard can await the same cached query
export function currentUserQueryOptions() {
  return {
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
  };
}

export function useCurrentUser() {
  return useQuery(currentUserQueryOptions());
}

export function syncUserCache(queryClient: QueryClient, user: unknown) {
  queryClient.setQueryData(userKeys.profile(), user);
  queryClient.setQueryData(authKeys.currentUser(), user);
}

export function invalidateUserCaches(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: authKeys.currentUser() }),
    queryClient.invalidateQueries({ queryKey: userKeys.profile() }),
  ]);
}

// Port of apps/web auth.context.tsx + hooks/use-auth.ts: state comes from the cached
// useCurrentUser query; App.vue calls provideAuth() once, descendants useAuth() via inject,
// and the router guard (outside any component) uses authStoreReady()/the module fallback.
import {
  computed,
  inject,
  provide,
  ref,
  watch,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from 'vue';

import {
  useCurrentUser,
  useLogin,
  useLogout,
  useRegister,
  useVerifyEmail,
} from '@/lib/api/hooks/use-auth';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types/auth.types';

export interface AuthStore {
  user: ComputedRef<User | undefined>;
  isAuthenticated: ComputedRef<boolean>;
  isLoading: ComputedRef<boolean>;
  requires2FA: Ref<boolean>;
  login: (data: LoginRequest) => Promise<LoginResponse>;
  register: (data: RegisterRequest) => Promise<unknown>;
  logout: (sessionId?: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<unknown>;
  refreshUser: () => Promise<unknown>;
  isLoggingIn: ComputedRef<boolean>;
  isRegistering: ComputedRef<boolean>;
  isLoggingOut: ComputedRef<boolean>;
  isVerifyingEmail: ComputedRef<boolean>;
  /** Resolves once the initial current-user fetch has settled (guard waits on this). */
  whenLoaded: () => Promise<void>;
}

const AuthKey: InjectionKey<AuthStore> = Symbol('auth');

let fallback: AuthStore | null = null;
let resolveStore: (store: AuthStore) => void = () => {};
const storeReady = new Promise<AuthStore>((resolve) => {
  resolveStore = resolve;
});

export function provideAuth(): AuthStore {
  const currentUser = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const verifyEmailMutation = useVerifyEmail();

  const requires2FA = ref(false);

  const user = computed(() => currentUser.data.value);

  let loadedPromise: Promise<void> | null = null;
  function whenLoaded() {
    if (!loadedPromise) {
      loadedPromise = new Promise<void>((resolve) => {
        const stop = watch(
          () => currentUser.isLoading.value,
          (loading) => {
            if (!loading) {
              stop();
              resolve();
            }
          },
          { immediate: true },
        );
      });
    }
    return loadedPromise;
  }

  const store: AuthStore = {
    user,
    isAuthenticated: computed(() => !!user.value),
    isLoading: computed(() => currentUser.isLoading.value),
    requires2FA,
    login: async (data) => {
      const response = await loginMutation.mutateAsync(data);
      requires2FA.value = !!response.requires2FA;
      return response;
    },
    register: (data) => registerMutation.mutateAsync(data),
    logout: (sessionId) => logoutMutation.mutateAsync(sessionId),
    verifyEmail: (token) => verifyEmailMutation.mutateAsync(token),
    refreshUser: () => currentUser.refetch(),
    isLoggingIn: computed(() => loginMutation.isPending.value),
    isRegistering: computed(() => registerMutation.isPending.value),
    isLoggingOut: computed(() => logoutMutation.isPending.value),
    isVerifyingEmail: computed(() => verifyEmailMutation.isPending.value),
    whenLoaded,
  };

  // Once a user loads, the 2FA interstitial is no longer pending
  watch(user, (u) => {
    if (u) requires2FA.value = false;
  });

  fallback = store;
  resolveStore(store);
  provide(AuthKey, store);
  return store;
}

export function useAuth(): AuthStore {
  const store = inject(AuthKey, null) ?? fallback;
  if (!store) {
    throw new Error('useAuth must be used within App (provideAuth)');
  }
  return store;
}

/** For the router guard, which runs outside any component instance. */
export async function authStoreReady(): Promise<AuthStore> {
  return fallback ?? storeReady;
}

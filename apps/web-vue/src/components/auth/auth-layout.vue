<script lang="ts">
export type AuthVariant = 'login' | 'signup';
</script>

<script setup lang="ts">
import Button from '@/components/ui/button.vue';
import { SITE_URL } from '@/lib/constants';
import { useOAuth } from '@/lib/api/hooks/use-auth';

const props = withDefaults(defineProps<{ variant?: AuthVariant }>(), { variant: 'login' });

const { initiateOAuth, isLoading: oauthLoading } = useOAuth();

// ponytail: mirrors apps/web OAuthRedirectHandler — popup stores target, this reload picks it up.
const oauthRedirectUrl = sessionStorage.getItem('oauth_redirect_url');
if (oauthRedirectUrl) {
  sessionStorage.removeItem('oauth_redirect_url');
  window.location.replace(new URL(oauthRedirectUrl, SITE_URL).href);
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-black text-white">
    <div class="absolute inset-0 overflow-hidden">
      <div
        class="blob animate-blob-1 absolute top-[10%] left-[-30%] h-[500px] w-[500px] rounded-full bg-orange-600/40 blur-[120px]"
      />
      <div
        class="blob animate-blob-2 absolute right-[-30%] bottom-[10%] h-[500px] w-[500px] rounded-full bg-amber-600/40 blur-[120px]"
      />
      <div
        class="blob animate-blob-3 absolute bottom-[-10%] left-[20%] h-[400px] w-[400px] rounded-full bg-yellow-600/30 blur-[100px]"
      />
      <div
        class="blob animate-blob-4 absolute top-[-10%] right-[20%] h-[400px] w-[400px] rounded-full bg-red-500/30 blur-[100px]"
      />
    </div>
    <div
      class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"
    />

    <header class="mx-auto flex h-16 w-full max-w-5xl items-center px-4 sm:px-6">
      <RouterLink to="/" class="relative block h-8 w-32">
        <img src="/image/wds-logo.svg" alt="WebDev Studios" class="h-full w-full object-contain" />
      </RouterLink>
    </header>

    <main class="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div class="w-full max-w-[520px] space-y-8">
        <div class="space-y-2 text-left">
          <h1 class="text-3xl font-semibold text-white">Welcome to WebDev Studios</h1>
          <p class="text-lg text-white/70">The new way to build software</p>
          <p class="font-mono text-xs tracking-[0.2em] text-white/40 uppercase">
            build · ship · learn
          </p>
        </div>

        <div class="space-y-3">
          <Button
            type="button"
            variant="outline"
            :disabled="oauthLoading"
            class="group relative h-12 w-full justify-start overflow-hidden rounded-lg border border-white/10 bg-white/5 text-white transition-all hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            @click="initiateOAuth('google')"
          >
            <div class="relative z-10 flex items-center gap-3">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Tiếp tục với Google</span>
            </div>
            <div
              class="from-wds-accent/20 via-wds-accent/10 absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l to-transparent opacity-0 transition-opacity group-hover:opacity-100"
            />
          </Button>
          <Button
            type="button"
            variant="outline"
            :disabled="oauthLoading"
            class="group relative h-12 w-full justify-start overflow-hidden rounded-lg border border-white/10 bg-white/5 text-white transition-all hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            @click="initiateOAuth('github')"
          >
            <div class="relative z-10 flex items-center gap-3">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.027 2.747-1.027.546 1.377.203 2.394.1 2.647.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>Tiếp tục với GitHub</span>
            </div>
            <div
              class="from-wds-accent/20 via-wds-accent/10 absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l to-transparent opacity-0 transition-opacity group-hover:opacity-100"
            />
          </Button>
        </div>

        <slot />

        <div class="text-center text-sm text-white/60">
          <template v-if="props.variant === 'login'">
            Chưa có tài khoản?
            <RouterLink to="/auth/signup" class="text-white hover:text-white/80"
              >Đăng kí</RouterLink
            >
          </template>
          <template v-else>
            Đã có tài khoản?
            <RouterLink to="/auth/login" class="text-white hover:text-white/80"
              >Đăng nhập</RouterLink
            >
          </template>
        </div>
        <div class="text-center text-xs text-white/40">
          <template v-if="props.variant === 'signup'">
            Bằng cách tạo tài khoản, bạn đồng ý với
            <RouterLink to="/terms" class="hover:text-wds-accent text-white"
              >Điều khoản dịch vụ</RouterLink
            >
            và
            <RouterLink to="/privacy" class="hover:text-wds-accent text-white"
              >Chính sách bảo mật</RouterLink
            >
          </template>
          <template v-else>
            <RouterLink to="/terms" class="hover:text-wds-accent text-white"
              >Điều khoản dịch vụ</RouterLink
            >
            và
            <RouterLink to="/privacy" class="hover:text-wds-accent text-white"
              >Chính sách bảo mật</RouterLink
            >
          </template>
        </div>
      </div>
    </main>
  </div>
</template>

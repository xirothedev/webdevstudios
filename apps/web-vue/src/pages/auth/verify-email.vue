<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AuthLayout from '@/components/auth/auth-layout.vue';
import Button from '@/components/ui/button.vue';
import { useVerifyEmail } from '@/lib/api/hooks/use-auth';
import { usePageMeta } from '@/lib/metadata';

usePageMeta({
  title: 'Xác thực email',
  description: 'Xác thực địa chỉ email của bạn để hoàn tất đăng ký tài khoản WebDev Studios.',
  path: '/auth/verify-email',
  image: '/seo/landing.webp',
  keywords: ['Xác thực email WDS', 'WebDev Studios verify email'],
});

const route = useRoute();
const router = useRouter();
const token = typeof route.query.token === 'string' ? route.query.token : null;

const verifyEmail = useVerifyEmail();
const errorMessage = () =>
  verifyEmail.error.value instanceof Error
    ? verifyEmail.error.value.message
    : 'Token không hợp lệ hoặc đã hết hạn';

// auto-verify once on mount (mirrors apps/web useEffect); success toast + redirect handled in the hook.
onMounted(() => {
  if (
    token &&
    !verifyEmail.isPending.value &&
    !verifyEmail.isSuccess.value &&
    !verifyEmail.isError.value
  ) {
    verifyEmail.mutate(token);
  }
});
</script>

<template>
  <!-- no token: invalid link -->
  <AuthLayout v-if="!token" variant="login">
    <div class="space-y-4 text-center">
      <h2 class="text-2xl font-semibold text-white">Token không hợp lệ</h2>
      <p class="text-white/60">Link xác thực email không hợp lệ hoặc đã hết hạn.</p>
      <Button
        class="h-12 w-full rounded-lg bg-white text-black hover:bg-white/90"
        @click="router.push('/auth/login')"
      >
        Quay lại đăng nhập
      </Button>
    </div>
  </AuthLayout>

  <!-- verified -->
  <AuthLayout v-else-if="verifyEmail.isSuccess" variant="login">
    <div class="space-y-4 text-center">
      <h2 class="text-2xl font-semibold text-white">Xác thực thành công!</h2>
      <p class="text-white/60">
        Email của bạn đã được xác thực. Đang chuyển hướng đến trang đăng nhập...
      </p>
    </div>
  </AuthLayout>

  <!-- failed -->
  <AuthLayout v-else-if="verifyEmail.isError" variant="login">
    <div class="space-y-4 text-center">
      <h2 class="text-2xl font-semibold text-white">Xác thực thất bại</h2>
      <p class="text-white/60">{{ errorMessage() }}</p>
      <Button
        class="h-12 w-full rounded-lg bg-white text-black hover:bg-white/90"
        @click="router.push('/auth/login')"
      >
        Quay lại đăng nhập
      </Button>
    </div>
  </AuthLayout>

  <!-- pending -->
  <AuthLayout v-else variant="login">
    <div class="space-y-4 text-center">
      <h2 class="text-2xl font-semibold text-white">Đang xác thực email...</h2>
      <p class="text-white/60">Vui lòng đợi trong khi chúng tôi xác thực email của bạn.</p>
      <div v-if="verifyEmail.isPending" class="flex justify-center">
        <div
          class="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white"
        ></div>
      </div>
    </div>
  </AuthLayout>
</template>

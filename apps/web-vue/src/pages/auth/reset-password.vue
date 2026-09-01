<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useField, useForm } from 'vee-validate';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { z } from 'zod';

import AuthLayout from '@/components/auth/auth-layout.vue';
import Button from '@/components/ui/button.vue';
import Input from '@/components/ui/input.vue';
import { useResetPassword } from '@/lib/api/hooks/use-auth';
import { usePageMeta } from '@/lib/metadata';

usePageMeta({
  title: 'Đặt lại mật khẩu',
  description: 'Đặt lại mật khẩu mới cho tài khoản WebDev Studios của bạn.',
  path: '/auth/reset-password',
  image: '/seo/landing.webp',
  keywords: ['Đặt lại mật khẩu', 'Reset password', 'Tạo mật khẩu mới', 'Đổi mật khẩu WDS'],
});

const route = useRoute();
const router = useRouter();
const token = typeof route.query.token === 'string' ? route.query.token : null;

onMounted(() => {
  if (!token) router.replace('/auth/login');
});

const resetPasswordSchema = z
  .object({
    password: z.string().min(1, 'Mật khẩu là bắt buộc').min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(resetPasswordSchema),
  initialValues: { password: '', confirmPassword: '' },
});

const {
  value: password,
  errorMessage: passwordError,
  handleBlur: passwordBlur,
} = useField<string>('password');
const {
  value: confirmPassword,
  errorMessage: confirmPasswordError,
  handleBlur: confirmPasswordBlur,
} = useField<string>('confirmPassword');
const resetPassword = useResetPassword();
const isLoading = resetPassword.isPending;
const isSuccess = resetPassword.isSuccess;
const errorMessage = () =>
  resetPassword.error.value instanceof Error
    ? resetPassword.error.value.message
    : 'Token không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.';

// success toast + redirect to login handled inside the hook (mirrors apps/web).
const onSubmit = handleSubmit((values) => {
  if (!token) return;
  resetPassword.mutate({ token, newPassword: values.password });
});
</script>

<template>
  <AuthLayout variant="login">
    <!-- no token: invalid link (mirrors apps/web) -->
    <div v-if="!token" class="glass-card">
      <div class="space-y-4 text-center">
        <h2 class="text-2xl font-bold text-white drop-shadow-lg">Token không hợp lệ</h2>
        <p class="text-white/70">Link reset mật khẩu không hợp lệ hoặc đã hết hạn.</p>
        <RouterLink to="/auth/login">
          <Button class="glass-button h-12 w-full text-base font-semibold"
            >Quay lại đăng nhập</Button
          >
        </RouterLink>
      </div>
    </div>

    <!-- success (hook redirects after 2s) -->
    <div v-else-if="isSuccess" class="glass-card">
      <div class="space-y-4 text-center">
        <div
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20"
        >
          <svg
            class="h-8 w-8 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div class="space-y-2">
          <h3 class="text-lg font-semibold text-white">Đặt lại mật khẩu thành công!</h3>
          <p class="text-sm text-white/70">
            Mật khẩu của bạn đã được cập nhật. Đang chuyển hướng đến trang đăng nhập...
          </p>
        </div>
      </div>
    </div>

    <div v-else class="glass-card">
      <div class="mb-6 text-center">
        <h2 class="text-2xl font-bold text-white drop-shadow-lg">Đặt lại mật khẩu</h2>
        <p class="mt-2 text-sm text-white/70">Nhập mật khẩu mới của bạn</p>
      </div>

      <form class="space-y-5" @submit="onSubmit">
        <div class="space-y-2">
          <label for="password" class="block text-sm font-medium text-white/90">Mật khẩu mới</label>
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
            :disabled="isLoading"
            @blur="passwordBlur"
            class="glass-input"
          />
          <p v-if="passwordError" class="text-sm text-red-400">
            {{ passwordError }}
          </p>
        </div>

        <div class="space-y-2">
          <label for="confirmPassword" class="block text-sm font-medium text-white/90">
            Xác nhận mật khẩu
          </label>
          <Input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            :disabled="isLoading"
            @blur="confirmPasswordBlur"
            class="glass-input"
          />
          <p v-if="confirmPasswordError" class="text-sm text-red-400">
            {{ confirmPasswordError }}
          </p>
        </div>

        <div v-if="resetPassword.isError" class="rounded-lg bg-red-500/20 p-3 text-sm text-red-400">
          {{ errorMessage() }}
        </div>

        <Button
          type="submit"
          :disabled="isLoading"
          class="glass-button h-12 w-full text-base font-semibold"
        >
          {{ isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu' }}
        </Button>

        <div class="text-center">
          <RouterLink
            to="/auth/login"
            class="text-sm text-white/70 transition-colors hover:text-white"
            >Quay lại đăng nhập</RouterLink
          >
        </div>
      </form>
    </div>
  </AuthLayout>
</template>

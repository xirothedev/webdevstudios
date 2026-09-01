<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useField, useForm } from 'vee-validate';
import { z } from 'zod';

import AuthLayout from '@/components/auth/auth-layout.vue';
import Button from '@/components/ui/button.vue';
import Input from '@/components/ui/input.vue';
import { useAuth } from '@/composables/use-auth';
import { usePageMeta } from '@/lib/metadata';

usePageMeta({
  title: 'Đăng nhập',
  description: 'Đăng nhập vào tài khoản WebDev Studios để truy cập các tính năng độc quyền.',
  path: '/auth/login',
  image: '/seo/landing.webp',
  keywords: ['Đăng nhập WDS', 'WebDev Studios login', 'Đăng nhập vào WebDev Studios'],
});

const loginSchema = z.object({
  email: z.email('Email không hợp lệ').min(1, 'Email là bắt buộc'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc').min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  rememberMe: z.boolean(),
});

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: { email: '', password: '', rememberMe: false },
});

const { value: email, errorMessage: emailError, handleBlur: emailBlur } = useField<string>('email');
const {
  value: password,
  errorMessage: passwordError,
  handleBlur: passwordBlur,
} = useField<string>('password');
const { value: rememberMe } = useField<boolean>('rememberMe');

const auth = useAuth();
const isLoading = auth.isLoggingIn;

// success toast + 2FA interstitial + redirect handled inside useLogin() hook (mirrors apps/web).
const onSubmit = handleSubmit((values) => {
  auth.login(values);
});
</script>

<template>
  <AuthLayout variant="login">
    <div class="glass-card">
      <div class="mb-6 text-center">
        <h2 class="text-2xl font-bold text-white drop-shadow-lg">Đăng nhập</h2>
        <p class="mt-2 text-sm text-white/70">Chào mừng bạn quay lại</p>
      </div>

      <form class="space-y-5" @submit="onSubmit">
        <div class="space-y-2">
          <label for="email" class="block text-sm font-medium text-white/90">Email</label>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="Nhập địa chỉ email của bạn"
            :disabled="isLoading"
            @blur="emailBlur"
            class="glass-input"
          />
          <p v-if="emailError" class="text-sm text-red-400">{{ emailError }}</p>
        </div>

        <div class="space-y-2">
          <label for="password" class="block text-sm font-medium text-white/90">Mật khẩu</label>
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="Nhập mật khẩu của bạn"
            :disabled="isLoading"
            @blur="passwordBlur"
            class="glass-input"
          />
          <p v-if="passwordError" class="text-sm text-red-400">{{ passwordError }}</p>
          <div class="flex justify-end">
            <RouterLink
              to="/auth/forgot-password"
              class="text-sm text-white/70 transition-colors hover:text-white"
              >Quên mật khẩu?</RouterLink
            >
          </div>
        </div>

        <div class="flex items-center">
          <label
            for="rememberMe"
            class="flex cursor-pointer items-center gap-3 text-sm text-white/80 transition-colors hover:text-white"
          >
            <div class="relative">
              <input
                id="rememberMe"
                v-model="rememberMe"
                type="checkbox"
                :disabled="isLoading"
                class="sr-only"
              />
              <div
                class="flex h-5 w-5 items-center justify-center rounded border-2 transition-all"
                :class="[
                  rememberMe ? 'border-orange-500 bg-orange-500' : 'border-white/20 bg-white/5',
                  isLoading ? 'cursor-not-allowed opacity-50' : '',
                ]"
              >
                <svg
                  class="h-3.5 w-3.5 text-black transition-opacity"
                  :class="rememberMe ? 'opacity-100' : 'opacity-0'"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <span class="select-none">Ghi nhớ đăng nhập</span>
          </label>
        </div>

        <Button
          type="submit"
          :disabled="isLoading"
          class="glass-button h-12 w-full text-base font-semibold"
        >
          {{ isLoading ? 'Đang xử lý...' : 'Đăng nhập' }}
        </Button>
      </form>
    </div>
  </AuthLayout>
</template>

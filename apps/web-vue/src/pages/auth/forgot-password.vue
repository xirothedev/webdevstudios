<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useField, useForm } from 'vee-validate';
import { z } from 'zod';

import AuthLayout from '@/components/auth/auth-layout.vue';
import Button from '@/components/ui/button.vue';
import Input from '@/components/ui/input.vue';
import { useRequestPasswordReset } from '@/lib/api/hooks/use-auth';
import { usePageMeta } from '@/lib/metadata';

usePageMeta({
  title: 'Quên mật khẩu',
  description: 'Quên mật khẩu? Nhận link đặt lại mật khẩu qua email tại WebDev Studios.',
  path: '/auth/forgot-password',
  image: '/seo/landing.webp',
  keywords: ['Quên mật khẩu', 'Reset mật khẩu', 'Lấy lại mật khẩu', 'Forgot password WDS'],
});

const forgotPasswordSchema = z.object({
  email: z.email('Email không hợp lệ').min(1, 'Email là bắt buộc'),
});

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(forgotPasswordSchema),
  initialValues: { email: '' },
});

const { value: email, errorMessage: emailError, handleBlur: emailBlur } = useField<string>('email');
const requestPasswordReset = useRequestPasswordReset();
const isLoading = requestPasswordReset.isPending;
const isSuccess = requestPasswordReset.isSuccess;

// success/error toast handled inside the hook (mirrors apps/web).
const onSubmit = handleSubmit((values) => {
  requestPasswordReset.mutate(values.email);
});
</script>

<template>
  <AuthLayout variant="login">
    <div class="glass-card">
      <div class="mb-6 text-center">
        <h2 class="text-2xl font-bold text-white drop-shadow-lg">Quên mật khẩu</h2>
        <p class="mt-2 text-sm text-white/70">Nhập email của bạn để nhận link reset mật khẩu</p>
      </div>

      <div v-if="isSuccess" class="space-y-4 text-center">
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
          <h3 class="text-lg font-semibold text-white">Email đã được gửi!</h3>
          <p class="text-sm text-white/70">
            Vui lòng kiểm tra email để nhận link reset mật khẩu. Nếu không thấy email, vui lòng kiểm
            tra thư mục spam.
          </p>
        </div>
        <RouterLink to="/auth/login">
          <Button class="glass-button h-12 w-full text-base font-semibold"
            >Quay lại đăng nhập</Button
          >
        </RouterLink>
      </div>

      <form v-else class="space-y-5" @submit="onSubmit">
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

        <Button
          type="submit"
          :disabled="isLoading"
          class="glass-button h-12 w-full text-base font-semibold"
        >
          {{ isLoading ? 'Đang gửi...' : 'Gửi link reset mật khẩu' }}
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

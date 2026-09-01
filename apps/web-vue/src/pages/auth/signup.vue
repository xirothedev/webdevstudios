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
  title: 'Đăng ký',
  description:
    'Tạo tài khoản WebDev Studios để truy cập các tính năng độc quyền, quản lý đơn hàng và tham gia cộng đồng.',
  path: '/auth/signup',
  image: '/seo/landing.webp',
  keywords: ['Đăng ký WDS', 'WebDev Studios signup', 'Tạo tài khoản WebDev Studios'],
});

const signupSchema = z
  .object({
    fullName: z.string().min(1, 'Vui lòng nhập họ và tên'),
    email: z.email('Email không hợp lệ').min(1, 'Email là bắt buộc'),
    password: z.string().min(1, 'Mật khẩu là bắt buộc').min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(signupSchema),
  initialValues: { fullName: '', email: '', password: '', confirmPassword: '', phone: '' },
});

const {
  value: fullName,
  errorMessage: fullNameError,
  handleBlur: fullNameBlur,
} = useField<string>('fullName');
const { value: email, errorMessage: emailError, handleBlur: emailBlur } = useField<string>('email');
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
const { value: phone, errorMessage: phoneError, handleBlur: phoneBlur } = useField<string>('phone');

const auth = useAuth();
const isLoading = auth.isRegistering;

// success toast + redirect to login handled inside useRegister() hook (mirrors apps/web).
const onSubmit = handleSubmit(({ confirmPassword: _confirmPassword, ...data }) => {
  auth.register({ ...data, phone: data.phone?.trim() || undefined });
});
</script>

<template>
  <AuthLayout variant="signup">
    <div class="glass-card">
      <form class="space-y-5" @submit="onSubmit">
        <div class="space-y-2">
          <label for="fullName" class="block text-sm font-medium text-white/90">Họ và tên</label>
          <Input
            id="fullName"
            v-model="fullName"
            type="text"
            placeholder="Nhập họ và tên của bạn"
            :disabled="isLoading"
            @blur="fullNameBlur"
            class="glass-input"
          />
          <p v-if="fullNameError" class="text-sm text-red-400">
            {{ fullNameError }}
          </p>
        </div>

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
            placeholder="Tối thiểu 8 ký tự"
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
            placeholder="Nhập lại mật khẩu"
            :disabled="isLoading"
            @blur="confirmPasswordBlur"
            class="glass-input"
          />
          <p v-if="confirmPasswordError" class="text-sm text-red-400">
            {{ confirmPasswordError }}
          </p>
        </div>

        <div class="space-y-2">
          <label for="phone" class="block text-sm font-medium text-white/90">
            Số điện thoại <span class="text-white/50">(tùy chọn)</span>
          </label>
          <Input
            id="phone"
            v-model="phone"
            type="tel"
            placeholder="Nhập số điện thoại"
            :disabled="isLoading"
            @blur="phoneBlur"
            class="glass-input"
          />
          <p v-if="phoneError" class="text-sm text-red-400">{{ phoneError }}</p>
        </div>

        <Button
          type="submit"
          :disabled="isLoading"
          class="glass-button h-12 w-full text-base font-semibold"
        >
          {{ isLoading ? 'Đang xử lý...' : 'Đăng ký' }}
        </Button>
      </form>
    </div>
  </AuthLayout>
</template>

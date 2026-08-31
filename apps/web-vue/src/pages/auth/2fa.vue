<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useField, useForm } from 'vee-validate';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { z } from 'zod';

import AuthLayout from '@/components/auth/auth-layout.vue';
import Button from '@/components/ui/button.vue';
import Input from '@/components/ui/input.vue';
import { useVerify2FA } from '@/lib/api/hooks/use-auth';
import { usePageMeta } from '@/lib/metadata';

usePageMeta({
  title: 'Xác thực 2FA',
  description: 'Xác thực hai yếu tố để bảo vệ tài khoản của bạn tại WebDev Studios.',
  path: '/auth/2fa',
  image: '/seo/landing.webp',
  keywords: ['Xác thực 2FA', 'Two-factor authentication', 'Bảo mật 2 lớp WDS', 'Mã xác thực'],
});

const route = useRoute();
const sessionId = typeof route.query.sessionId === 'string' ? route.query.sessionId : undefined;

const verify2FASchema = z.object({
  code: z
    .string()
    .min(1, 'Mã xác thực là bắt buộc')
    .regex(/^\d{6}$/, 'Mã xác thực phải có 6 chữ số'),
});

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(verify2FASchema),
  initialValues: { code: '' },
});

const { value: code, errorMessage: codeError, handleBlur: codeBlur } = useField<string>('code');
const inputRef = ref<HTMLInputElement | null>(null);
const verify2FA = useVerify2FA();
const isLoading = verify2FA.isPending;
const errorMessage = () =>
  verify2FA.error.value instanceof Error
    ? verify2FA.error.value.message
    : 'Mã xác thực không hợp lệ. Vui lòng thử lại.';

onMounted(() => inputRef.value?.focus());

// auto-submit on 6 digits + keep only digits (mirrors apps/web).
watch(code, (value) => {
  if (value && value.length === 6 && !isLoading.value) {
    verify2FA.mutate({ code: value, sessionId });
  }
});

function onCodeInput(e: Event) {
  code.value = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6);
}

const onSubmit = handleSubmit((values) => {
  verify2FA.mutate({ code: values.code, sessionId });
});
</script>

<template>
  <AuthLayout variant="login">
    <div class="glass-card">
      <div class="mb-6 text-center">
        <h2 class="text-2xl font-bold text-white drop-shadow-lg">Xác thực 2FA</h2>
        <p class="mt-2 text-sm text-white/70">Nhập mã 6 chữ số từ ứng dụng xác thực của bạn</p>
      </div>

      <form class="space-y-5" @submit="onSubmit">
        <div class="space-y-2">
          <label for="code" class="block text-sm font-medium text-white/90">Mã xác thực</label>
          <Input
            id="code"
            ref="inputRef"
            :value="code"
            type="text"
            inputmode="numeric"
            placeholder="000000"
            maxlength="6"
            :disabled="isLoading"
            @input="onCodeInput"
            @blur="codeBlur"
            class="glass-input text-center text-2xl tracking-widest"
          />
          <p v-if="codeError" class="text-sm text-red-400">{{ codeError }}</p>
        </div>

        <div v-if="verify2FA.isError" class="rounded-lg bg-red-500/20 p-3 text-sm text-red-400">
          {{ errorMessage() }}
        </div>

        <Button
          type="submit"
          :disabled="isLoading || code.length !== 6"
          class="glass-button h-12 w-full text-base font-semibold"
        >
          {{ isLoading ? 'Đang xác thực...' : 'Xác thực' }}
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

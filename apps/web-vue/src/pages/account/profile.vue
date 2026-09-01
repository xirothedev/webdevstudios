<script setup lang="ts">
// Port of apps/web src/app/account/profile (page + ProfileLoading).
import { useHead } from '@unhead/vue';
import { Loader2, User } from 'lucide-vue-next';

import AccountLayout from '@/components/account/account-layout.vue';
import ProfileForm from '@/components/account/profile-form.vue';
import { useUserProfile } from '@/lib/api/hooks/use-user';
import { usePageMeta } from '@/lib/metadata';

usePageMeta({
  title: 'Hồ sơ của tôi',
  description:
    'Quản lý thông tin cá nhân, cập nhật ảnh đại diện và cài đặt tài khoản của bạn tại WebDev Studios.',
  path: '/account/profile',
  keywords: [
    'Hồ sơ cá nhân',
    'Quản lý tài khoản',
    'Cập nhật thông tin',
    'Tài khoản WebDev Studios',
  ],
});
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] });

const { data: user, isLoading, error } = useUserProfile();
</script>

<template>
  <div v-if="isLoading" class="flex min-h-[60vh] items-center justify-center">
    <div class="flex flex-col items-center gap-4">
      <Loader2 class="text-wds-accent h-8 w-8 animate-spin" />
      <p class="text-sm text-gray-600">Đang tải thông tin...</p>
    </div>
  </div>

  <AccountLayout
    v-else-if="error || !user"
    :icon="User"
    label="Tài khoản"
    title="Hồ sơ của tôi"
    description="Quản lý thông tin cá nhân và cài đặt tài khoản của bạn"
    :error="{
      title: 'Không thể tải thông tin hồ sơ',
      message: 'Vui lòng thử lại sau hoặc đăng nhập lại.',
    }"
  >
    <div />
  </AccountLayout>

  <AccountLayout
    v-else
    :icon="User"
    label="Tài khoản"
    title="Hồ sơ của tôi"
    description="Quản lý thông tin cá nhân và cài đặt tài khoản của bạn"
  >
    <div class="bg-wds-accent/5 border-wds-accent/20 rounded-2xl border p-6 sm:p-8">
      <div class="mb-6">
        <span class="text-wds-accent text-sm font-semibold tracking-wide uppercase"
          >Thông tin cá nhân</span
        >
      </div>
      <ProfileForm :user="user" />
    </div>
  </AccountLayout>
</template>

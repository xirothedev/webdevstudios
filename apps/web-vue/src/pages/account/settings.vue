<script setup lang="ts">
// Port of apps/web src/app/account/settings (page + SettingsContent).
import { useHead } from '@unhead/vue';
import { Loader2, Settings } from 'lucide-vue-next';

import AccountLayout from '@/components/account/account-layout.vue';
import SecuritySettings from '@/components/account/security-settings.vue';
import SessionsList from '@/components/account/sessions-list.vue';
import { useUserProfile } from '@/lib/api/hooks/use-user';
import { usePageMeta } from '@/lib/metadata';

usePageMeta({
  title: 'Cài đặt',
  description:
    'Quản lý cài đặt bảo mật, phiên làm việc và cấu hình tài khoản của bạn tại WebDev Studios.',
  path: '/account/settings',
  keywords: [
    'Cài đặt tài khoản',
    'Bảo mật tài khoản',
    'Quản lý phiên làm việc',
    'Cài đặt WebDev Studios',
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
    :icon="Settings"
    label="Tài khoản"
    title="Cài đặt"
    description="Quản lý cài đặt bảo mật và cấu hình tài khoản của bạn"
    :error="{
      title: 'Không thể tải thông tin cài đặt',
      message: 'Vui lòng thử lại sau hoặc đăng nhập lại.',
    }"
  >
    <div />
  </AccountLayout>

  <AccountLayout
    v-else
    :icon="Settings"
    label="Tài khoản"
    title="Cài đặt"
    description="Quản lý cài đặt bảo mật và cấu hình tài khoản của bạn"
  >
    <div class="space-y-8">
      <div>
        <div class="mb-6">
          <span class="text-wds-accent text-sm font-semibold tracking-wide uppercase">Bảo mật</span>
        </div>
        <SecuritySettings :user="user" />
      </div>

      <div>
        <div class="mb-6">
          <span class="text-wds-accent text-sm font-semibold tracking-wide uppercase"
            >Phiên làm việc đang hoạt động</span
          >
          <p class="mt-2 text-xs text-gray-600">
            Quản lý các phiên đăng nhập của bạn trên các thiết bị khác nhau
          </p>
        </div>
        <SessionsList />
      </div>
    </div>
  </AccountLayout>
</template>

<script setup lang="ts">
// Port of apps/web src/components/account/SecuritySettings.tsx
import { CheckCircle2, Info, Key, Shield } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';

import { Button } from '@/components/ui/button.vue';
import type { User } from '@/types/auth.types';

defineProps<{ user: User }>();
</script>

<template>
  <div class="space-y-6">
    <div class="bg-wds-accent/5 border-wds-accent/20 rounded-xl border p-6">
      <div class="mb-4 flex items-center gap-3">
        <div class="bg-wds-accent/20 flex h-10 w-10 items-center justify-center rounded-lg">
          <Shield class="text-wds-accent h-5 w-5" />
        </div>
        <div>
          <h3 class="text-base font-semibold text-gray-900">Xác thực hai yếu tố (2FA)</h3>
          <p class="text-xs text-gray-600">Bảo vệ tài khoản của bạn bằng mã xác thực</p>
        </div>
      </div>

      <div class="flex items-center justify-between rounded-lg bg-white p-4">
        <div class="flex items-center gap-3">
          <template v-if="user.mfaEnabled">
            <CheckCircle2 class="h-5 w-5 text-green-600" />
            <div>
              <p class="text-sm font-semibold text-gray-900">Đã bật 2FA</p>
              <p class="text-xs text-gray-600">Tài khoản của bạn đã được bảo vệ</p>
            </div>
          </template>
          <template v-else>
            <Info class="h-5 w-5 text-gray-400" />
            <div>
              <p class="text-sm font-semibold text-gray-900">Chưa bật 2FA</p>
              <p class="text-xs text-gray-600">Khuyến nghị bật để tăng cường bảo mật</p>
            </div>
          </template>
        </div>
        <Button
          as-child
          variant="outline"
          size="sm"
          :class="
            user.mfaEnabled
              ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'text-wds-accent border-wds-accent hover:bg-wds-accent/10 border-gray-300'
          "
        >
          <RouterLink to="/auth/2fa">{{ user.mfaEnabled ? 'Quản lý' : 'Bật 2FA' }}</RouterLink>
        </Button>
      </div>
    </div>

    <div class="bg-wds-accent/5 border-wds-accent/20 rounded-xl border p-6">
      <div class="mb-4 flex items-center gap-3">
        <div class="bg-wds-accent/20 flex h-10 w-10 items-center justify-center rounded-lg">
          <Key class="text-wds-accent h-5 w-5" />
        </div>
        <div>
          <h3 class="text-base font-semibold text-gray-900">Mật khẩu</h3>
          <p class="text-xs text-gray-600">Thay đổi mật khẩu của bạn</p>
        </div>
      </div>

      <div class="flex items-center justify-between rounded-lg bg-white p-4">
        <div>
          <p class="text-sm font-semibold text-gray-900">Mật khẩu</p>
          <p class="text-xs text-gray-600">Đã được thiết lập</p>
        </div>
        <Button
          as-child
          variant="outline"
          size="sm"
          class="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <RouterLink to="/auth/forgot-password">Đặt lại mật khẩu</RouterLink>
        </Button>
      </div>
    </div>

    <div class="bg-wds-accent/5 border-wds-accent/20 rounded-xl border p-6">
      <div class="mb-4">
        <h3 class="text-base font-semibold text-gray-900">Trạng thái xác thực</h3>
        <p class="text-xs text-gray-600">Xác thực email và số điện thoại của bạn</p>
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between rounded-lg bg-white p-4">
          <div class="flex items-center gap-3">
            <template v-if="user.emailVerified">
              <CheckCircle2 class="h-5 w-5 text-green-600" />
              <div>
                <p class="text-sm font-semibold text-gray-900">Email đã xác thực</p>
                <p class="text-xs text-gray-600">{{ user.email }}</p>
              </div>
            </template>
            <template v-else>
              <Info class="h-5 w-5 text-gray-400" />
              <div>
                <p class="text-sm font-semibold text-gray-900">Email chưa xác thực</p>
                <p class="text-xs text-gray-600">{{ user.email }}</p>
              </div>
            </template>
          </div>
          <Button
            v-if="!user.emailVerified"
            as-child
            variant="outline"
            size="sm"
            class="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <RouterLink to="/auth/verify-email">Xác thực</RouterLink>
          </Button>
        </div>

        <div v-if="user.phone" class="flex items-center justify-between rounded-lg bg-white p-4">
          <div class="flex items-center gap-3">
            <template v-if="user.phoneVerified">
              <CheckCircle2 class="h-5 w-5 text-green-600" />
              <div>
                <p class="text-sm font-semibold text-gray-900">Số điện thoại đã xác thực</p>
                <p class="text-xs text-gray-600">{{ user.phone }}</p>
              </div>
            </template>
            <template v-else>
              <Info class="h-5 w-5 text-gray-400" />
              <div>
                <p class="text-sm font-semibold text-gray-900">Số điện thoại chưa xác thực</p>
                <p class="text-xs text-gray-600">{{ user.phone }}</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

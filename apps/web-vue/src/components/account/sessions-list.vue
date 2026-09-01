<script setup lang="ts">
// Port of apps/web src/components/account/SessionsList.tsx
import { computed } from 'vue';
import { LogOut, Monitor, Smartphone, Tablet } from 'lucide-vue-next';

import { Button } from '@/components/ui/button.vue';
import { useRevokeSession, useSessions } from '@/lib/api/hooks/use-settings';
import { relativeTime } from '@/lib/date';
import type { Session } from '@/types/auth.types';

const sessions = useSessions();
const revokeSession = useRevokeSession();

function deviceIcon(type: string | null) {
  switch (type?.toUpperCase()) {
    case 'MOBILE':
      return Smartphone;
    case 'TABLET':
      return Tablet;
    default:
      return Monitor;
  }
}

function deviceTypeLabel(type: string | null): string {
  switch (type?.toUpperCase()) {
    case 'MOBILE':
      return 'Điện thoại';
    case 'TABLET':
      return 'Máy tính bảng';
    case 'DESKTOP':
      return 'Máy tính';
    default:
      return 'Thiết bị';
  }
}

function statusLabel(status: Session['status']): string {
  if (status === 'ACTIVE') return 'Đang hoạt động';
  if (status === 'EXPIRED') return 'Đã hết hạn';
  return 'Đã hủy';
}

// Same simplified current-session detection as apps/web: first ACTIVE session.
const currentSessionId = computed(
  () => sessions.data.value?.find((s) => s.status === 'ACTIVE')?.id,
);

function lastSeen(session: Session): string {
  return relativeTime(new Date(session.device?.lastSeenAt || session.createdAt));
}

function handleRevoke(sessionId: string) {
  if (!confirm('Bạn có chắc chắn muốn đăng xuất phiên làm việc này?')) return;
  revokeSession.mutate(sessionId);
}
</script>

<template>
  <div v-if="sessions.isLoading.value" class="flex items-center justify-center py-8">
    <p class="text-sm text-gray-600">Đang tải danh sách phiên làm việc...</p>
  </div>

  <div
    v-else-if="sessions.error.value"
    class="flex flex-col items-center justify-center gap-2 py-8 text-center"
  >
    <p class="text-sm font-semibold text-gray-900">Không thể tải danh sách phiên làm việc</p>
    <p class="text-xs text-gray-600">Vui lòng thử lại sau</p>
  </div>

  <div
    v-else-if="!sessions.data.value || sessions.data.value.length === 0"
    class="flex flex-col items-center justify-center gap-2 py-8 text-center"
  >
    <p class="text-sm text-gray-600">Không có phiên làm việc nào</p>
  </div>

  <div v-else class="space-y-3">
    <div
      v-for="session in sessions.data.value"
      :key="session.id"
      class="bg-wds-accent/5 border-wds-accent/20 rounded-xl border p-4 transition-all"
      :class="session.id === currentSessionId && 'border-wds-accent/40 bg-wds-accent/10'"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 space-y-2">
          <div class="flex items-center gap-3">
            <div class="bg-wds-accent/20 flex h-10 w-10 items-center justify-center rounded-lg">
              <component
                :is="deviceIcon(session.device?.type || null)"
                class="text-wds-accent h-5 w-5"
              />
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-semibold text-gray-900">
                  {{ session.device?.name || deviceTypeLabel(session.device?.type || null) }}
                </h3>
                <span
                  v-if="session.id === currentSessionId"
                  class="bg-wds-accent rounded-full px-2 py-0.5 text-xs font-bold text-black"
                  >Phiên hiện tại</span
                >
              </div>
              <p v-if="session.userAgent" class="mt-1 line-clamp-1 text-xs text-gray-500">
                {{ session.userAgent }}
              </p>
            </div>
          </div>

          <div class="ml-13 space-y-1 text-xs text-gray-600">
            <p v-if="session.ipAddress">
              <span class="font-medium">IP:</span> {{ session.ipAddress }}
            </p>
            <p><span class="font-medium">Hoạt động:</span> {{ lastSeen(session) }}</p>
            <p>
              <span class="font-medium">Trạng thái:</span>
              <span
                class="font-semibold"
                :class="{
                  'text-green-600': session.status === 'ACTIVE',
                  'text-yellow-600': session.status === 'EXPIRED',
                  'text-red-600': session.status === 'REVOKED',
                }"
                >{{ statusLabel(session.status) }}</span
              >
            </p>
          </div>
        </div>

        <Button
          v-if="session.id !== currentSessionId && session.status === 'ACTIVE'"
          type="button"
          variant="outline"
          size="sm"
          :disabled="revokeSession.isPending.value"
          class="border-gray-300 text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          @click="handleRevoke(session.id)"
        >
          <LogOut class="h-4 w-4" />
          <span class="hidden sm:inline">Đăng xuất</span>
        </Button>
      </div>
    </div>
  </div>
</template>

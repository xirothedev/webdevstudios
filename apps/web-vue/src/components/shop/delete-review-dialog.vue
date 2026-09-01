<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next';

import { Button } from '@/components/ui/button.vue';

defineProps<{ isDeleting: boolean }>();

defineEmits<{ close: []; confirm: [] }>();
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="mx-4 w-full max-w-md rounded-xl border border-white/10 bg-black p-6 shadow-lg">
      <div class="mb-4 flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle class="h-5 w-5 text-red-400" />
        </div>
        <div>
          <h3 class="text-lg font-bold text-white">Xóa đánh giá</h3>
          <p class="text-sm text-white/60">Chỉ admin mới có thể xóa đánh giá</p>
        </div>
      </div>

      <p class="mb-6 text-white/80">
        Bạn có chắc muốn xóa đánh giá này? Hành động này không thể hoàn tác.
      </p>

      <div class="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          :disabled="isDeleting"
          class="border-white/10 text-white"
          @click="$emit('close')"
        >
          Hủy
        </Button>
        <Button
          type="button"
          :disabled="isDeleting"
          class="bg-red-500 font-semibold text-white hover:bg-red-600"
          @click="$emit('confirm')"
        >
          {{ isDeleting ? 'Đang xóa...' : 'Xóa đánh giá' }}
        </Button>
      </div>
    </div>
  </div>
</template>

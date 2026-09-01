<script setup lang="ts">
// Port of apps/web src/components/account/AvatarUpload.tsx
import { ref } from 'vue';
import { Camera, Loader2 } from 'lucide-vue-next';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.vue';
import { Button } from '@/components/ui/button.vue';
import { useUpdateAvatar } from '@/lib/api/hooks/use-user';
import { toast } from '@/lib/toast';
import { getAvatarInitials } from '@/lib/utils/avatar';
import type { User } from '@/types/auth.types';

const props = defineProps<{ user: User; className?: string }>();

const fileInputRef = ref<HTMLInputElement | null>(null);
const preview = ref<string | null>(null);
const updateAvatar = useUpdateAvatar();

const initials = getAvatarInitials(props.user.fullName, props.user.email);
const isLoading = updateAvatar.isPending;

function resetInput() {
  if (fileInputRef.value) fileInputRef.value.value = '';
}

function handleFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    toast.error('Định dạng file không hợp lệ. Vui lòng chọn file JPG, PNG hoặc WebP.');
    resetInput();
    return;
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    toast.error('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
    resetInput();
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    preview.value = reader.result as string;
  };
  reader.readAsDataURL(file);

  updateAvatar.mutate(file, {
    onSuccess: () => {
      preview.value = null;
      resetInput();
    },
    onError: () => {
      preview.value = null;
      resetInput();
    },
  });
}

const avatarUrl = () => preview.value || props.user.avatar;
</script>

<template>
  <div class="flex flex-col items-center gap-4" :class="props.className">
    <div class="relative">
      <Avatar class="h-24 w-24 border-4 border-white shadow-lg sm:h-32 sm:w-32">
        <AvatarImage
          v-if="avatarUrl()"
          :src="avatarUrl()"
          :alt="user.fullName || user.email"
          class="object-cover"
        />
        <AvatarFallback class="bg-wds-accent/20 text-wds-accent text-2xl font-bold sm:text-3xl">{{
          initials
        }}</AvatarFallback>
      </Avatar>

      <div
        v-if="isLoading"
        class="absolute inset-0 flex items-center justify-center rounded-full bg-black/50"
      >
        <Loader2 class="h-6 w-6 animate-spin text-white" />
      </div>
    </div>

    <div class="flex flex-col items-center gap-2">
      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        class="hidden"
        aria-label="Upload avatar"
        @change="handleFileSelect"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        :disabled="isLoading"
        class="gap-2"
        @click="fileInputRef?.click()"
      >
        <Camera class="h-4 w-4" />
        <span>Thay đổi ảnh</span>
      </Button>
      <p class="text-xs text-gray-500">JPG, PNG hoặc WebP (tối đa 5MB)</p>
    </div>
  </div>
</template>

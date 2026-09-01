<script setup lang="ts">
// Port of apps/web src/components/account/ProfileForm.tsx. The React source uses plain
// useState + hand-rolled validation (no RHF/zod), so this mirrors it with plain refs.
import { computed, ref, watch } from 'vue';
import { CheckCircle2, Info, Loader2 } from 'lucide-vue-next';

import { Button } from '@/components/ui/button.vue';
import { useUpdateProfile } from '@/lib/api/hooks/use-user';
import type { User } from '@/types/auth.types';

const props = defineProps<{ user: User; className?: string }>();

const fullName = ref(props.user.fullName || '');
const phone = ref(props.user.phone || '');
const errors = ref<{ fullName?: string; phone?: string }>({});

watch(
  () => props.user,
  (u) => {
    fullName.value = u.fullName || '';
    phone.value = u.phone || '';
  },
);

const updateProfile = useUpdateProfile();
const isLoading = updateProfile.isPending;

const hasChanges = computed(() => {
  const u = props.user;
  return fullName.value.trim() !== (u.fullName || '') || phone.value.trim() !== (u.phone || '');
});

const inputClass =
  'flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-wds-accent focus:ring-wds-accent/20 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50';

function validate(): boolean {
  const newErrors: { fullName?: string; phone?: string } = {};
  if (!fullName.value.trim()) {
    newErrors.fullName = 'Họ tên là bắt buộc';
  } else if (fullName.value.trim().length > 100) {
    newErrors.fullName = 'Họ tên không được vượt quá 100 ký tự';
  }
  if (phone.value && phone.value.length > 15) {
    newErrors.phone = 'Số điện thoại không được vượt quá 15 ký tự';
  }
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
}

function handleSubmit(event: Event) {
  event.preventDefault();
  if (!validate()) return;
  updateProfile.mutate({
    fullName: fullName.value.trim() || undefined,
    phone: phone.value.trim() || undefined,
  });
}
</script>

<template>
  <form class="space-y-6" :class="props.className" @submit="handleSubmit">
    <div class="space-y-2">
      <label for="email" class="text-sm font-semibold text-gray-900">Email</label>
      <input
        id="email"
        type="email"
        :value="user.email"
        disabled
        :class="[inputClass, 'bg-gray-50 text-gray-600']"
      />
      <div class="flex items-center justify-between">
        <p class="text-xs text-gray-500">Email không thể thay đổi</p>
        <div class="flex items-center gap-2">
          <template v-if="user.emailVerified">
            <CheckCircle2 class="size-4 text-green-600" />
            <span class="text-xs font-medium text-green-600">Xác thực email</span>
          </template>
          <template v-else>
            <Info class="size-4 text-gray-400" />
            <span class="text-xs font-medium text-gray-500">Chưa xác thực email</span>
          </template>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <label for="fullName" class="text-sm font-semibold text-gray-900"
        >Họ tên<span class="ml-1 text-red-500">*</span></label
      >
      <input
        id="fullName"
        v-model="fullName"
        type="text"
        placeholder="Nhập họ tên của bạn"
        maxlength="100"
        :disabled="isLoading"
        :aria-invalid="!!errors.fullName"
        :aria-describedby="errors.fullName ? 'fullName-error' : undefined"
        :class="inputClass"
        @input="errors.fullName = undefined"
      />
      <p v-if="errors.fullName" id="fullName-error" class="text-xs text-red-600">
        {{ errors.fullName }}
      </p>
      <p v-else class="text-xs text-gray-500">Tối đa 100 ký tự</p>
    </div>

    <div class="space-y-2">
      <label for="phone" class="text-sm font-semibold text-gray-900">Số điện thoại</label>
      <input
        id="phone"
        v-model="phone"
        type="tel"
        placeholder="Nhập số điện thoại của bạn"
        maxlength="15"
        :disabled="isLoading"
        :aria-invalid="!!errors.phone"
        :aria-describedby="errors.phone ? 'phone-error' : undefined"
        :class="inputClass"
        @input="errors.phone = undefined"
      />
      <p v-if="errors.phone" id="phone-error" class="text-xs text-red-600">{{ errors.phone }}</p>
      <div v-else class="flex items-center justify-between">
        <p class="text-xs text-gray-500">Tối đa 15 ký tự</p>
        <div class="flex items-center gap-2">
          <template v-if="user.phoneVerified">
            <CheckCircle2 class="size-4 text-green-600" />
            <span class="text-xs font-medium text-green-600">Xác thực số điện thoại</span>
          </template>
          <template v-else>
            <Info class="size-4 text-gray-400" />
            <span class="text-xs font-medium text-gray-500">Chưa xác thực số điện thoại</span>
          </template>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <Button
        type="submit"
        :disabled="!hasChanges || isLoading"
        class="bg-wds-accent hover:bg-wds-accent/90 text-black"
      >
        <template v-if="isLoading">
          <Loader2 class="size-4 animate-spin" />
          <span>Đang lưu…</span>
        </template>
        <template v-else>Lưu thay đổi</template>
      </Button>
    </div>
  </form>
</template>

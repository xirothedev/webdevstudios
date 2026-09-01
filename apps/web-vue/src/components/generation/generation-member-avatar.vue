<script setup lang="ts">
// Port of apps/web src/components/generation/GenerationMemberAvatar.tsx.
import { Crown } from 'lucide-vue-next';
import { computed } from 'vue';

import { getInitials } from '@/data/generations';

const props = withDefaults(
  defineProps<{
    avatar?: string;
    name: string;
    isLeader?: boolean;
    size?: 'small' | 'large';
    variant?: 'mobile' | 'desktop';
  }>(),
  { isLeader: false, size: 'small', variant: 'mobile' },
);

const initials = computed(() => getInitials(props.name));

// Size classes based on size prop and variant
const sizeClasses = computed(() =>
  props.size === 'large'
    ? props.variant === 'desktop'
      ? 'h-40 w-40'
      : 'h-20 w-20 sm:h-28 sm:w-28'
    : props.variant === 'desktop'
      ? 'h-28 w-28'
      : 'h-14 w-14 sm:h-20 sm:w-20',
);

const textSizeClasses = computed(() =>
  props.size === 'large'
    ? props.variant === 'desktop'
      ? 'text-2xl'
      : 'text-lg sm:text-2xl'
    : props.variant === 'desktop'
      ? 'text-lg'
      : 'text-sm sm:text-base',
);

const crownSizeClasses = computed(() =>
  props.size === 'large'
    ? props.variant === 'desktop'
      ? 'h-8 w-8'
      : 'h-6 w-6 sm:h-7 sm:w-7'
    : props.variant === 'desktop'
      ? 'h-6 w-6'
      : 'h-5 w-5 sm:h-6 sm:w-6',
);

const crownIconSizeClasses = computed(() =>
  props.size === 'large'
    ? props.variant === 'desktop'
      ? 'h-4 w-4'
      : 'h-3 w-3 sm:h-3.5 sm:w-3.5'
    : props.variant === 'desktop'
      ? 'h-3 w-3'
      : 'h-2.5 w-2.5 sm:h-3 sm:w-3',
);

const containerClasses = computed(() =>
  props.size === 'large'
    ? 'from-wds-accent to-wds-accent/70 shadow-wds-accent/30 group-hover:shadow-wds-accent/50 overflow-hidden rounded-full bg-linear-to-br shadow-lg transition-shadow'
    : 'bg-wds-accent/20 overflow-hidden rounded-full',
);

const fallbackClasses = computed(() =>
  props.size === 'large'
    ? 'from-wds-accent to-wds-accent/70 shadow-wds-accent/30 flex items-center justify-center rounded-full bg-linear-to-br text-black shadow-lg font-black'
    : 'bg-wds-accent/20 text-wds-accent flex items-center justify-center rounded-full font-bold',
);

const crownPositionClasses = computed(() =>
  props.size === 'large'
    ? props.variant === 'desktop'
      ? 'right-2 bottom-2'
      : '-right-1 -bottom-1'
    : props.variant === 'desktop'
      ? 'right-1 bottom-1'
      : '-right-0.5 -bottom-0.5',
);
</script>

<template>
  <div class="relative">
    <div v-if="avatar" :class="containerClasses">
      <img
        :src="avatar"
        :alt="name"
        loading="lazy"
        :class="`${sizeClasses} object-cover transition-transform duration-300 ${size === 'large' ? 'group-hover:scale-110' : 'group-hover:scale-105'}`"
      />
    </div>
    <div v-else :class="`${fallbackClasses} ${sizeClasses} ${textSizeClasses}`">{{ initials }}</div>
    <div
      v-if="isLeader"
      :class="`text-wds-accent absolute ${crownPositionClasses} flex ${crownSizeClasses} items-center justify-center rounded-full border-2 border-white bg-black shadow-lg`"
    >
      <Crown :class="crownIconSizeClasses" />
    </div>
  </div>
</template>

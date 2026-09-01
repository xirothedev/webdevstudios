<script setup lang="ts">
// Port of apps/web src/components/partner/PartnerCard.tsx.
import { motion } from 'motion-v';

import type { CommunityPartner, MediaPartner, StrategicPartner } from '@/data/partners';

const props = withDefaults(
  defineProps<{
    partner: StrategicPartner | CommunityPartner | MediaPartner;
    size?: 'lg' | 'md' | 'sm';
  }>(),
  {
    size: 'md',
  },
);

const sizeClasses = {
  lg: 'h-40 p-8 md:h-48',
  md: 'h-32 p-6',
  sm: 'h-24 p-4',
};

const iconSizes = {
  lg: 'scale-125',
  md: 'scale-100',
  sm: 'scale-75',
};

// icon size per card size (JSX embedded the size in the React data icons)
const iconPx = { lg: 40, md: 32, sm: 24 };
</script>

<template>
  <motion.div
    :variants="{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }"
    :class="`group hover:border-wds-accent/50 hover:bg-wds-accent/5 relative flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/3 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(247,147,30,0.15)] ${sizeClasses[props.size]} `"
  >
    <!-- Glow effect inside card -->
    <div
      class="from-wds-accent/0 via-wds-accent/0 to-wds-accent/0 group-hover:from-wds-accent/10 absolute inset-0 rounded-2xl bg-linear-to-br opacity-0 transition-opacity duration-500 group-hover:to-transparent group-hover:opacity-100"
    />

    <div
      :class="`text-gray-400 transition-colors duration-300 group-hover:text-white ${iconSizes[props.size]}`"
    >
      <component :is="props.partner.icon" :size="iconPx[props.size]" />
    </div>

    <div v-if="props.size !== 'sm'" class="mt-4 text-center">
      <h3 class="group-hover:text-wds-accent font-semibold text-white opacity-90 transition-colors">
        {{ props.partner.name }}
      </h3>
      <p
        v-if="'category' in props.partner && props.partner.category"
        class="mt-1 text-xs text-gray-500"
      >
        {{ props.partner.category }}
      </p>
    </div>
  </motion.div>
</template>

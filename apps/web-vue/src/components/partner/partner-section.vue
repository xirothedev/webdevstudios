<script setup lang="ts">
// Port of apps/web src/components/partner/PartnerSection.tsx.
import { motion } from 'motion-v';

defineProps<{ label?: string; title?: string; subtitle?: string }>();
</script>

<template>
  <div class="mb-12 flex flex-col gap-3 text-center">
    <motion.span
      v-if="label"
      :initial="{ opacity: 0, y: 10 }"
      :while-in-view="{ opacity: 1, y: 0 }"
      :viewport="{ once: true }"
      class="text-wds-accent text-xs font-bold tracking-widest uppercase"
    >
      {{ label }}
    </motion.span>
    <motion.h2
      v-if="title"
      :initial="{ opacity: 0, y: 10 }"
      :while-in-view="{ opacity: 1, y: 0 }"
      :viewport="{ once: true }"
      :transition="{ delay: 0.1 }"
      class="text-3xl font-bold text-balance text-white md:text-4xl"
    >
      {{ title }}
    </motion.h2>
    <motion.p
      v-if="subtitle"
      :initial="{ opacity: 0, y: 10 }"
      :while-in-view="{ opacity: 1, y: 0 }"
      :viewport="{ once: true }"
      :transition="{ delay: 0.2 }"
      class="mx-auto max-w-2xl text-pretty text-gray-400"
    >
      {{ subtitle }}
    </motion.p>
  </div>
</template>

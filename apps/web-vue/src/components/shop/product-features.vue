<script setup lang="ts">
import { Check } from 'lucide-vue-next';
import { Motion } from 'motion-v';

withDefaults(defineProps<{ features: string[]; title?: string }>(), {
  title: 'Đặc điểm nổi bật',
});
</script>

<template>
  <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
    <h3 class="mb-4 text-sm font-semibold tracking-wider text-white/90 uppercase">{{ title }}</h3>
    <ul class="space-y-3">
      <Motion
        v-for="(feature, index) in features"
        :key="index"
        as="li"
        :initial="{ opacity: 0, x: -10 }"
        :animate="{ opacity: 1, x: 0 }"
        :transition="{ delay: 0.3 + index * 0.1 }"
        class="flex items-center gap-3 text-sm text-white/70"
      >
        <div class="bg-wds-accent/20 flex h-5 w-5 items-center justify-center rounded-full">
          <Check class="text-wds-accent h-3 w-3" />
        </div>
        {{ feature }}
      </Motion>
    </ul>
  </div>
</template>

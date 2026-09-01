<script setup lang="ts">
import { onMounted } from 'vue';

import { getCsrfToken } from '@/lib/csrf';

// Prefetches the CSRF token on app boot so the first state-changing request has it.
onMounted(() => {
  getCsrfToken().catch((error) => {
    // Silently fail - token will be fetched on-demand if needed
    console.warn('Failed to prefetch CSRF token:', error);
  });
});
</script>

<template>
  <div hidden />
</template>

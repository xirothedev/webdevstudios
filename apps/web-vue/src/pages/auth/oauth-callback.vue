<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

import { SITE_URL } from '@/lib/constants';

const route = useRoute();

// Popup child page: posts the result back to window.opener and closes (mirrors apps/web).
onMounted(() => {
  const q = route.query;
  const error = typeof q.error === 'string' ? q.error : null;
  const errorDescription = typeof q.error_description === 'string' ? q.error_description : null;
  const redirectUrl = typeof q.redirect_url === 'string' ? q.redirect_url : null;

  if (window.opener) {
    const allowedOrigin = new URL(SITE_URL).origin;
    if (error) {
      window.opener.postMessage(
        {
          type: 'oauth-error',
          data: { error, errorDescription: errorDescription || 'OAuth authentication failed' },
        },
        allowedOrigin,
      );
    } else {
      window.opener.postMessage(
        { type: 'oauth-success', data: { redirectUrl: redirectUrl || '/' } },
        allowedOrigin,
      );
    }
  }

  setTimeout(() => window.close(), 100);
});
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-black text-white">
    <div class="text-center">
      <div class="mb-4">
        <div
          class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-orange-500"
        />
      </div>
      <p class="text-sm text-white/70">Đang xử lý đăng nhập...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// mirrors apps/web app/admin/layout.tsx (guard itself lives in the router, meta.admin).
import { useHead } from '@unhead/vue';

import AdminSidebar from './admin-sidebar.vue';

// apps/web createAdminPageMetadata: robots noindex on every admin page.
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] });
</script>

<template>
  <!-- apps/web admin layout is a full-screen sidebar shell; App.vue hides site chrome via meta.chrome -->
  <div class="bg-wds-background flex h-screen">
    <AdminSidebar />
    <main class="flex-1 overflow-y-auto"><slot /></main>
  </div>
</template>

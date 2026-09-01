<script setup lang="ts">
// mirrors apps/web app/admin/layout.tsx (guard itself lives in the router, meta.admin).
import { useHead } from '@unhead/vue';

import AdminSidebar from './admin-sidebar.vue';

// apps/web createAdminPageMetadata: robots noindex on every admin page.
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] });
</script>

<template>
  <!-- ponytail: -mt cancels App.vue's pt-14/16 — App.vue is off-limits and apps/web's admin
         layout is a full-screen sidebar shell with no site navbar. -->
  <div class="bg-wds-background -mt-14 flex h-screen md:-mt-16">
    <AdminSidebar />
    <main class="flex-1 overflow-y-auto"><slot /></main>
  </div>
</template>

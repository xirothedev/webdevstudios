<script setup lang="ts">
import { useHead } from '@unhead/vue';

import CsrfInitializer from '@/components/CsrfInitializer.vue';
import Footer from '@/components/Footer.vue';
import Navbar from '@/components/Navbar.vue';
import { provideAuth } from '@/composables/use-auth';
import { useCartDrawer } from '@/composables/use-cart-drawer';
import { defaultMetadata } from '@/lib/metadata';
import { getOrganizationSchema, getWebSiteSchema } from '@/lib/structured-data';

provideAuth();
// cart drawer state is provided app-wide; the drawer UI itself lands with the shop ticket
useCartDrawer();

// Root layout head (apps/web layout.tsx metadata) + StructuredData.tsx JSON-LD scripts.
// Pages override title/description via usePageMeta (child head wins over app head).
useHead({
  ...defaultMetadata,
  htmlAttrs: { lang: 'vi' },
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(getOrganizationSchema()) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(getWebSiteSchema()) },
  ],
});
</script>

<template>
  <CsrfInitializer />
  <Navbar />
  <main class="bg-background text-foreground min-h-screen pt-14 md:pt-16">
    <RouterView />
  </main>
  <Footer />
</template>

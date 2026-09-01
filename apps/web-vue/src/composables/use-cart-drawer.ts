import { ref } from 'vue';

// Module singleton (port of apps/web cart-drawer.context.tsx) — a boolean flag needs no
// provide/inject; every importer shares one ref, which IS the fallback pattern.
const isOpen = ref(false);

export function useCartDrawer() {
  return {
    isOpen,
    openDrawer: () => {
      isOpen.value = true;
    },
    closeDrawer: () => {
      isOpen.value = false;
    },
    toggleDrawer: () => {
      isOpen.value = !isOpen.value;
    },
  };
}

<script setup lang="ts">
import { ShoppingCart, Trash2, X } from 'lucide-vue-next';
import { AnimatePresence, Motion } from 'motion-v';
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { RouterLink } from 'vue-router';

import { Button } from '@/components/ui/button.vue';
import { useCartDrawer } from '@/composables/use-cart-drawer';
import { useCart, useRemoveFromCart, useUpdateCartItem } from '@/lib/api/hooks/use-cart';
import { isFreeShipping, shippingFee } from '@/lib/shipping';
import { formatPrice } from '@/lib/utils';

import QuantitySelector from './quantity-selector.vue';

// Mirrors apps/web FloatingCartButton (the drawer UI lives here; apps/web has no
// standalone CartDrawer component).
const { isOpen, openDrawer, closeDrawer } = useCartDrawer();
const { data: cart, isLoading } = useCart();
const updateCartItemMutation = useUpdateCartItem();
const removeFromCartMutation = useRemoveFromCart();

const totalItems = computed(() => cart.value?.totalItems ?? 0);
const hasItems = computed(() => totalItems.value > 0 && !isLoading.value);

const handleUpdateQuantity = (itemId: string, quantity: number) => {
  if (quantity < 1) return;
  updateCartItemMutation.mutate({ cartItemId: itemId, data: { quantity } });
};

const handleRemoveItem = (itemId: string) => {
  removeFromCartMutation.mutate(itemId);
};

const isItemUpdating = (itemId: string) => {
  return (
    (updateCartItemMutation.isPending.value &&
      updateCartItemMutation.variables.value?.cartItemId === itemId) ||
    (removeFromCartMutation.isPending.value && removeFromCartMutation.variables.value === itemId)
  );
};

const handleClickOutside = (e: MouseEvent) => {
  if (!isOpen.value) return;
  const target = e.target as HTMLElement;
  if (!target.closest('[data-cart-drawer]') && !target.closest('[data-cart-button]')) {
    closeDrawer();
  }
};

// Close drawer when clicking outside
onMounted(() => document.addEventListener('mousedown', handleClickOutside));
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside));

// Prevent body scroll when drawer is open
watch(
  isOpen,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : '';
  },
  { immediate: true },
);
onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<template>
  <!-- Floating Button -->
  <Motion
    as="button"
    data-cart-button
    class="bg-wds-accent fixed right-6 bottom-6 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full text-black shadow-lg transition-shadow hover:shadow-xl"
    :while-hover="{ scale: 1.05 }"
    :while-tap="{ scale: 0.95 }"
    aria-label="Mở giỏ hàng"
    @click="openDrawer"
  >
    <ShoppingCart class="h-6 w-6" />
    <Motion
      v-if="hasItems"
      as="span"
      :initial="{ scale: 0 }"
      :animate="{ scale: 1 }"
      class="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
    >
      {{ totalItems > 9 ? '9+' : totalItems }}
    </Motion>
  </Motion>

  <!-- Drawer -->
  <AnimatePresence>
    <!-- Backdrop -->
    <Motion
      v-if="isOpen"
      as="div"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      class="fixed inset-0 z-50 bg-black/50"
      @click="closeDrawer"
    />

    <Motion
      v-if="isOpen"
      as="div"
      data-cart-drawer
      :initial="{ x: '100%' }"
      :animate="{ x: 0 }"
      :exit="{ x: '100%' }"
      :transition="{ type: 'spring', damping: 25, stiffness: 200 }"
      class="bg-wds-background fixed top-0 right-0 z-50 h-full w-full max-w-md shadow-2xl"
    >
      <div class="flex h-full flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 class="text-xl font-bold text-white">Giỏ hàng</h2>
          <button
            class="text-white/70 transition-colors hover:text-white"
            aria-label="Đóng giỏ hàng"
            @click="closeDrawer"
          >
            <X class="h-6 w-6" />
          </button>
        </div>

        <!-- Cart Items -->
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <div v-if="!hasItems" class="flex flex-col items-center justify-center py-20">
            <ShoppingCart class="mb-6 h-24 w-24 text-white/20" />
            <h3 class="mb-2 text-lg font-semibold text-white">Giỏ hàng trống</h3>
            <p class="mb-8 text-center text-sm text-white/60">
              Hãy thêm sản phẩm vào giỏ hàng để tiếp tục
            </p>
            <Button class="bg-wds-accent hover:bg-wds-accent/90 text-black" @click="closeDrawer">
              Tiếp tục mua sắm
            </Button>
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="item in cart?.items"
              :key="item.id"
              class="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div class="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                <img
                  :src="item.productImage"
                  :alt="item.productName"
                  class="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div class="flex flex-1 flex-col gap-2">
                <h3 class="line-clamp-2 text-sm font-semibold text-white">
                  {{ item.productName }}
                </h3>
                <p v-if="item.size" class="text-xs text-white/60">Size: {{ item.size }}</p>
                <p class="text-wds-accent text-sm font-bold">
                  {{ formatPrice(item.productPrice) }}₫
                </p>

                <div class="flex items-center gap-2">
                  <QuantitySelector
                    :quantity="item.quantity"
                    :max="item.stockAvailable"
                    :disabled="isItemUpdating(item.id)"
                    variant="compact"
                    :show-icons="false"
                    size="sm"
                    @increase="handleUpdateQuantity(item.id, item.quantity + 1)"
                    @decrease="handleUpdateQuantity(item.id, item.quantity - 1)"
                  />

                  <Button
                    :disabled="isItemUpdating(item.id)"
                    variant="ghost"
                    size="icon"
                    class="h-auto w-auto text-red-400 hover:bg-transparent hover:text-red-300 disabled:opacity-30"
                    @click="handleRemoveItem(item.id)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-bold text-white">{{ formatPrice(item.subtotal) }}₫</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="hasItems" class="border-t border-white/10 px-6 py-4">
          <div class="mb-4 space-y-2">
            <div class="flex justify-between text-white/80">
              <span>Tạm tính:</span>
              <span class="font-semibold">{{ formatPrice(cart?.totalAmount ?? 0) }}₫</span>
            </div>
            <div class="flex justify-between text-white/80">
              <span>Phí vận chuyển:</span>
              <span class="font-semibold">
                {{
                  isFreeShipping(cart?.totalAmount ?? 0)
                    ? 'Miễn phí'
                    : formatPrice(shippingFee(cart?.totalAmount ?? 0)) + '₫'
                }}
              </span>
            </div>
            <div
              class="flex justify-between border-t border-white/10 pt-2 text-lg font-bold text-white"
            >
              <span>Tổng cộng:</span>
              <span>
                {{ formatPrice((cart?.totalAmount ?? 0) + shippingFee(cart?.totalAmount ?? 0)) }}₫
              </span>
            </div>
          </div>
          <RouterLink to="/cart" @click="closeDrawer">
            <Button
              class="bg-wds-accent hover:bg-wds-accent/90 h-12 w-full font-semibold text-black"
            >
              Xem giỏ hàng
            </Button>
          </RouterLink>
        </div>
      </div>
    </Motion>
  </AnimatePresence>
</template>

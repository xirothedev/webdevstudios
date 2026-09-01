<script setup lang="ts">
import { ShoppingCart, Trash2 } from 'lucide-vue-next';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import QuantitySelector from '@/components/shop/quantity-selector.vue';
import { Button } from '@/components/ui/button.vue';
import { useCart, useRemoveFromCart, useUpdateCartItem } from '@/lib/api/hooks/use-cart';
import { usePageMeta } from '@/lib/metadata';
import { isFreeShipping, shippingFee } from '@/lib/shipping';
import { formatPrice } from '@/lib/utils';

usePageMeta({
  title: 'Giỏ hàng',
  description:
    'Xem và quản lý giỏ hàng của bạn tại WebDev Studios. Kiểm tra sản phẩm, số lượng và tổng tiền trước khi thanh toán.',
  path: '/cart',
  keywords: [
    'Giỏ hàng',
    'Shopping cart',
    'Mua sắm',
    'WebDev Studios',
    'E-commerce',
    'Thương mại điện tử',
  ],
});

const router = useRouter();

const { data: cart, error: cartError, isLoading } = useCart();

const updateCartItemMutation = useUpdateCartItem();
const removeFromCartMutation = useRemoveFromCart();

const isEmpty = computed(
  () => !!cartError.value || !cart.value || !cart.value.items || cart.value.items.length === 0,
);

const handleUpdateQuantity = (itemId: string, quantity: number) => {
  if (quantity < 1) return;
  updateCartItemMutation.mutate({ cartItemId: itemId, data: { quantity } });
};

const handleRemoveItem = (itemId: string) => {
  removeFromCartMutation.mutate(itemId);
};

// Check if specific item is being updated (only during actual API call, not during debounce)
const isItemUpdating = (itemId: string) => {
  return (
    (updateCartItemMutation.isPending.value &&
      updateCartItemMutation.variables.value?.cartItemId === itemId) ||
    (removeFromCartMutation.isPending.value && removeFromCartMutation.variables.value === itemId)
  );
};
</script>

<template>
  <div class="bg-wds-background text-wds-text min-h-screen">
    <div class="pt-24 pb-20">
      <div class="mx-auto max-w-7xl px-6">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex flex-col gap-8">
          <div class="h-9 w-48 animate-pulse rounded bg-white/10" />
          <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <!-- Cart Items Skeleton -->
            <div class="space-y-4 lg:col-span-2">
              <div
                v-for="i in 2"
                :key="i"
                class="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-6"
              >
                <div class="h-24 w-24 animate-pulse rounded-lg bg-white/10" />
                <div class="flex-1 space-y-3">
                  <div class="h-5 w-3/4 animate-pulse rounded bg-white/10" />
                  <div class="h-4 w-1/4 animate-pulse rounded bg-white/10" />
                  <div class="h-6 w-1/3 animate-pulse rounded bg-white/10" />
                  <div class="h-8 w-32 animate-pulse rounded bg-white/10" />
                </div>
              </div>
            </div>
            <!-- Order Summary Skeleton -->
            <div class="lg:col-span-1">
              <div class="sticky top-24 rounded-xl border border-white/10 bg-white/5 p-6">
                <div class="mb-4 h-6 w-32 animate-pulse rounded bg-white/10" />
                <div class="mb-6 space-y-3">
                  <div class="h-4 w-full animate-pulse rounded bg-white/10" />
                  <div class="h-4 w-full animate-pulse rounded bg-white/10" />
                  <div class="h-6 w-full animate-pulse rounded bg-white/10" />
                </div>
                <div class="h-12 w-full animate-pulse rounded bg-white/10" />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="isEmpty" class="flex flex-col items-center justify-center py-20">
          <ShoppingCart class="mb-6 h-24 w-24 text-white/20" />
          <h2 class="mb-2 text-2xl font-bold text-white">Giỏ hàng trống</h2>
          <p class="mb-8 text-white/60">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục</p>
          <Button
            class="bg-wds-accent hover:bg-wds-accent/90 text-black"
            @click="router.push('/shop')"
          >
            Tiếp tục mua sắm
          </Button>
        </div>

        <template v-else-if="cart">
          <h1 class="mb-8 text-3xl font-bold text-white">Giỏ hàng</h1>

          <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <!-- Cart Items -->
            <div class="space-y-4 lg:col-span-2">
              <div
                v-for="item in cart.items"
                :key="item.id"
                class="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-6"
              >
                <img
                  :src="item.productImage"
                  :alt="item.productName"
                  class="h-24 w-24 rounded-lg object-cover"
                  loading="lazy"
                />
                <div class="flex-1">
                  <h3 class="mb-1 font-semibold text-white">{{ item.productName }}</h3>
                  <p v-if="item.size" class="mb-2 text-sm text-white/60">Size: {{ item.size }}</p>
                  <p class="text-wds-accent mb-4 font-bold">
                    {{ formatPrice(item.productPrice) }}₫
                  </p>

                  <div class="flex items-center gap-4">
                    <QuantitySelector
                      :quantity="item.quantity"
                      :stock="item.stockAvailable"
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
                      <Trash2 class="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold text-white">{{ formatPrice(item.subtotal) }}₫</p>
                </div>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="lg:col-span-1">
              <div class="sticky top-24 rounded-xl border border-white/10 bg-white/5 p-6">
                <h2 class="mb-4 text-xl font-bold text-white">Tóm tắt đơn hàng</h2>
                <div class="mb-6 space-y-3">
                  <div class="flex justify-between text-white/80">
                    <span>Tạm tính:</span>
                    <span>{{ formatPrice(cart.totalAmount) }}₫</span>
                  </div>
                  <div class="flex justify-between text-white/80">
                    <span>Phí vận chuyển:</span>
                    <span>
                      {{
                        isFreeShipping(cart.totalAmount)
                          ? 'Miễn phí'
                          : formatPrice(shippingFee(cart.totalAmount)) + '₫'
                      }}
                    </span>
                  </div>
                  <div
                    class="flex justify-between border-t border-white/10 pt-3 text-lg font-bold text-white"
                  >
                    <span>Tổng cộng:</span>
                    <span
                      >{{ formatPrice(cart.totalAmount + shippingFee(cart.totalAmount)) }}₫</span
                    >
                  </div>
                </div>
                <Button
                  class="bg-wds-accent hover:bg-wds-accent/90 h-12 w-full font-semibold text-black"
                  @click="router.push('/checkout')"
                >
                  Thanh toán
                </Button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

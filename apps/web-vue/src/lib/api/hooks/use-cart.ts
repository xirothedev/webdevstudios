import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';

import { useCartDrawer } from '@/composables/use-cart-drawer';
import {
  type AddToCartRequest,
  type Cart,
  cartApi,
  type UpdateCartItemRequest,
} from '@/lib/api/cart';
import { useDebouncedCallback } from '@/lib/hooks/use-debounce';
import { isFreeShipping, shippingFee } from '@/lib/shipping';
import { toast } from '@/lib/toast';
import { formatPrice } from '@/lib/utils';

// Query Keys
export const cartKeys = {
  all: ['cart'] as const,
  current: () => [...cartKeys.all, 'current'] as const,
};

// Query: Get user's cart
export function useCart() {
  return useQuery({
    queryKey: cartKeys.current(),
    queryFn: () => cartApi.getCart(),
    staleTime: 30 * 1000, // 30 seconds
    retry: false,
  });
}

// Mutation: Add to cart
export function useAddToCart() {
  const queryClient = useQueryClient();
  const { openDrawer } = useCartDrawer();

  return useMutation({
    mutationFn: (data: AddToCartRequest) => cartApi.addToCart(data),
    onSuccess: () => {
      // Invalidate cart to refetch
      queryClient.invalidateQueries({ queryKey: cartKeys.current() });
      toast.success('Đã thêm vào giỏ hàng!');
      openDrawer();
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}

// Helper function to update cart item quantity in cache
function updateCartItemQuantity(
  cart: Cart | undefined,
  cartItemId: string,
  quantity: number,
): Cart | undefined {
  if (!cart) return cart;

  const updatedItems = cart.items.map((item) => {
    if (item.id === cartItemId) {
      const newSubtotal = item.productPrice * quantity;
      return {
        ...item,
        quantity,
        subtotal: newSubtotal,
      };
    }
    return item;
  });

  const totalAmount = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    ...cart,
    items: updatedItems,
    totalAmount,
    totalItems,
  };
}

// Mutation: Update cart item with optimistic updates and debounce
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  // Track original cart state before optimistic updates for rollback
  const originalCart = new Map<string, Cart | undefined>();

  const mutation = useMutation({
    mutationFn: ({ cartItemId, data }: { cartItemId: string; data: UpdateCartItemRequest }) =>
      cartApi.updateCartItem(cartItemId, data),
    onMutate: async ({ cartItemId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartKeys.current() });

      // Get the original cart state (stored when optimistic update was applied)
      const previousCart = originalCart.get(cartItemId);

      // Return context with original snapshot
      return { previousCart };
    },
    onSuccess: (data, variables) => {
      // Remove from tracking
      originalCart.delete(variables.cartItemId);
      // Update cache with server response
      queryClient.setQueryData(cartKeys.current(), data);
    },
    onError: (error: unknown, variables, context) => {
      // Remove from tracking
      originalCart.delete(variables.cartItemId);
      // Rollback to original value on error
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(cartKeys.current(), context.previousCart);
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Không thể cập nhật giỏ hàng. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });

  // Debounced API call
  const debouncedApiCall = useDebouncedCallback(
    (variables: { cartItemId: string; data: UpdateCartItemRequest }) => {
      mutation.mutate(variables);
    },
    500,
  );

  // Combined mutate function: optimistic update immediately + debounced API call
  const mutate = (variables: { cartItemId: string; data: UpdateCartItemRequest }) => {
    // Get current cart state (may already be optimistic from previous clicks)
    const currentCart = queryClient.getQueryData<Cart>(cartKeys.current());

    if (currentCart) {
      // Store current state as "previous" for rollback (always update to latest)
      originalCart.set(variables.cartItemId, currentCart);

      // Apply optimistic update immediately
      const optimisticCart = updateCartItemQuantity(
        currentCart,
        variables.cartItemId,
        variables.data.quantity,
      );
      queryClient.setQueryData(cartKeys.current(), optimisticCart);
    }

    // Debounce the API call
    debouncedApiCall(variables);
  };

  return {
    ...mutation,
    mutate,
  };
}

// Helper function to remove cart item from cache
function removeCartItem(cart: Cart | undefined, cartItemId: string): Cart | undefined {
  if (!cart) return cart;

  const updatedItems = cart.items.filter((item) => item.id !== cartItemId);

  const totalAmount = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    ...cart,
    items: updatedItems,
    totalAmount,
    totalItems,
  };
}

// Mutation: Remove from cart with optimistic updates
export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartItemId: string) => cartApi.removeFromCart(cartItemId),
    onMutate: async (cartItemId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartKeys.current() });

      // Snapshot previous value
      const previousCart = queryClient.getQueryData<Cart>(cartKeys.current());

      // Optimistically remove item from cache
      if (previousCart) {
        const optimisticCart = removeCartItem(previousCart, cartItemId);
        queryClient.setQueryData(cartKeys.current(), optimisticCart);
      }

      // Return context with snapshot
      return { previousCart };
    },
    onSuccess: (data) => {
      // Update cache with server response
      queryClient.setQueryData(cartKeys.current(), data);
      toast.success('Đã xóa khỏi giỏ hàng');
    },
    onError: (error: unknown, _cartItemId, context) => {
      // Rollback to previous value on error
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.current(), context.previousCart);
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Không thể xóa khỏi giỏ hàng. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}

// Shared cart behavior for cart.vue, floating-cart-button.vue: optimistic
// quantity/remove wiring plus per-item pending state, so UIs keep only markup.
export function useCartActions() {
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    updateCartItemMutation.mutate({ cartItemId: itemId, data: { quantity } });
  };

  const removeItem = (itemId: string) => {
    removeFromCartMutation.mutate(itemId);
  };

  // Check if specific item is being updated (only during actual API call, not during debounce)
  const isUpdating = (itemId: string) => {
    return (
      (updateCartItemMutation.isPending.value &&
        updateCartItemMutation.variables.value?.cartItemId === itemId) ||
      (removeFromCartMutation.isPending.value && removeFromCartMutation.variables.value === itemId)
    );
  };

  return { updateQuantity, removeItem, isUpdating };
}

// Shared footer math for cart.vue, floating-cart-button.vue, checkout.vue.
// Structural `{ value }` so both Refs and computed unions (checkout's Buy Now branch) fit.
export function cartTotals(cart: { value: Cart | undefined }) {
  const subtotal = computed(() => cart.value?.totalAmount ?? 0);
  const fee = computed(() => shippingFee(subtotal.value));
  return {
    subtotal,
    fee,
    total: computed(() => subtotal.value + fee.value),
    isFreeShipping: computed(() => isFreeShipping(subtotal.value)),
    shippingLabel: computed(() => (fee.value === 0 ? 'Miễn phí' : `${formatPrice(fee.value)}₫`)),
    totalLabel: computed(() => `${formatPrice(subtotal.value + fee.value)}₫`),
  };
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.current() });
      toast.success('Đã xóa tất cả khỏi giỏ hàng');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Không thể xóa giỏ hàng. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}

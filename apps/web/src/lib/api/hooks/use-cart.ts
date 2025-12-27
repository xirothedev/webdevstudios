'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useRef } from 'react';
import { toast } from 'sonner';

import { useCartDrawer } from '@/contexts/cart-drawer.context';
import {
  AddToCartRequest,
  Cart,
  cartApi,
  UpdateCartItemRequest,
} from '@/lib/api/cart';
import { useDebouncedCallback } from '@/lib/hooks/use-debounce';

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

// Suspense Query: Get user's cart (for Suspense boundary)
export function useSuspenseCart() {
  return useSuspenseQuery({
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
        error instanceof Error
          ? error.message
          : 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}

// Helper function to update cart item quantity in cache
function updateCartItemQuantity(
  cart: Cart | undefined,
  cartItemId: string,
  quantity: number
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

  const totalAmount = updatedItems.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );
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
  const originalCartRef = useRef<Map<string, Cart | undefined>>(new Map());

  const mutation = useMutation({
    mutationFn: ({
      cartItemId,
      data,
    }: {
      cartItemId: string;
      data: UpdateCartItemRequest;
    }) => cartApi.updateCartItem(cartItemId, data),
    onMutate: async ({ cartItemId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartKeys.current() });

      // Get the original cart state (stored when optimistic update was applied)
      const originalCart = originalCartRef.current.get(cartItemId);

      // Return context with original snapshot
      return { previousCart: originalCart };
    },
    onSuccess: (data, variables) => {
      // Remove from tracking
      originalCartRef.current.delete(variables.cartItemId);
      // Update cache with server response
      queryClient.setQueryData(cartKeys.current(), data);
    },
    onError: (error: unknown, variables, context) => {
      // Remove from tracking
      originalCartRef.current.delete(variables.cartItemId);
      // Rollback to original value on error
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(cartKeys.current(), context.previousCart);
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Không thể cập nhật giỏ hàng. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });

  // Debounced API call
  const debouncedApiCall = useDebouncedCallback(
    (variables: { cartItemId: string; data: UpdateCartItemRequest }) => {
      mutation.mutate(variables);
    },
    500
  );

  // Combined mutate function: optimistic update immediately + debounced API call
  const mutate = (variables: {
    cartItemId: string;
    data: UpdateCartItemRequest;
  }) => {
    // Get current cart state (may already be optimistic from previous clicks)
    const currentCart = queryClient.getQueryData<Cart>(cartKeys.current());

    if (currentCart) {
      // Store current state as "previous" for rollback (always update to latest)
      // This ensures we rollback to the state just before this update
      originalCartRef.current.set(variables.cartItemId, currentCart);

      // Apply optimistic update immediately
      const optimisticCart = updateCartItemQuantity(
        currentCart,
        variables.cartItemId,
        variables.data.quantity
      );
      queryClient.setQueryData(cartKeys.current(), optimisticCart);
    }

    // Debounce the API call
    debouncedApiCall(variables);
  };

  return {
    ...mutation,
    mutate,
    // Keep original mutate for immediate API call if needed
    mutateSync: mutation.mutate,
  };
}

// Helper function to remove cart item from cache
function removeCartItem(
  cart: Cart | undefined,
  cartItemId: string
): Cart | undefined {
  if (!cart) return cart;

  const updatedItems = cart.items.filter((item) => item.id !== cartItemId);

  const totalAmount = updatedItems.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );
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
        error instanceof Error
          ? error.message
          : 'Không thể xóa khỏi giỏ hàng. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}

// Mutation: Clear cart
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
        error instanceof Error
          ? error.message
          : 'Không thể xóa giỏ hàng. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}

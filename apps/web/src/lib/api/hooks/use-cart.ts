'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  AddToCartRequest,
  cartApi,
  UpdateCartItemRequest,
} from '@/lib/api/cart';

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

  return useMutation({
    mutationFn: (data: AddToCartRequest) => cartApi.addToCart(data),
    onSuccess: () => {
      // Invalidate cart to refetch
      queryClient.invalidateQueries({ queryKey: cartKeys.current() });
      toast.success('Đã thêm vào giỏ hàng!');
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

// Mutation: Update cart item
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cartItemId,
      data,
    }: {
      cartItemId: string;
      data: UpdateCartItemRequest;
    }) => cartApi.updateCartItem(cartItemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.current() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Không thể cập nhật giỏ hàng. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}

// Mutation: Remove from cart
export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartItemId: string) => cartApi.removeFromCart(cartItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.current() });
      toast.success('Đã xóa khỏi giỏ hàng');
    },
    onError: (error: unknown) => {
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

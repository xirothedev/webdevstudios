import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';

import { adminKeys } from '@/lib/api/hooks/use-admin';
import { type CreateOrderRequest, ordersApi, type OrderStatus } from '@/lib/api/orders';
import { toast } from '@/lib/toast';

// Reactive-params convention for all hook composables in this directory: params accept
// MaybeRefOrGetter (plain value | ref | getter); queryKey uses computed(() => ...toValue(param)),
// queryFn reads toValue(param) at call time, `enabled` is a computed. Plain args work unchanged.

// Query Keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (page?: number, limit?: number) => [...orderKeys.lists(), page, limit] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

// Query: List user orders
export function useOrders(
  page: MaybeRefOrGetter<number> = 1,
  limit: MaybeRefOrGetter<number> = 10,
) {
  return useQuery({
    queryKey: computed(() => orderKeys.list(toValue(page), toValue(limit))),
    queryFn: () => ordersApi.listOrders(toValue(page), toValue(limit)),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Query: Get order by ID
export function useOrder(orderId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => orderKeys.detail(toValue(orderId))),
    queryFn: () => ordersApi.getOrderById(toValue(orderId)),
    enabled: computed(() => !!toValue(orderId)),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Mutation: Create order
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersApi.createOrder(data),
    onSuccess: () => {
      // Invalidate orders list and cart
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đơn hàng đã được tạo thành công!');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Không thể tạo đơn hàng. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}

// Mutation: Cancel order
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => ordersApi.cancelOrder(orderId),
    onSuccess: (_, orderId) => {
      // Invalidate order detail and orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success('Đơn hàng đã được hủy thành công!');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Không thể hủy đơn hàng. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}

// Mutation: Update order status (admin only)
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      ordersApi.updateOrderStatus(orderId, status),
    onSuccess: (_, variables) => {
      // Invalidate order detail + user lists + the admin orders list the page reads
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.orderId),
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'orders'] });
      toast.success('Trạng thái đơn hàng đã được cập nhật!');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}

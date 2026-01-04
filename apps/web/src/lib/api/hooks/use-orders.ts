/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { CreateOrderRequest, ordersApi, OrderStatus } from '@/lib/api/orders';

// Query Keys
const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (page?: number, limit?: number) =>
    [...orderKeys.lists(), page, limit] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

// Query: List user orders
export function useOrders(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: orderKeys.list(page, limit),
    queryFn: () => ordersApi.listOrders(page, limit),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Suspense Query: List user orders (for Suspense boundary)
export function useSuspenseOrders(page: number = 1, limit: number = 10) {
  return useSuspenseQuery({
    queryKey: orderKeys.list(page, limit),
    queryFn: () => ordersApi.listOrders(page, limit),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Query: Get order by ID
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => ordersApi.getOrderById(orderId),
    enabled: !!orderId,
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
        error instanceof Error
          ? error.message
          : 'Không thể tạo đơn hàng. Vui lòng thử lại.';
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
        error instanceof Error
          ? error.message
          : 'Không thể hủy đơn hàng. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}

// Mutation: Update order status (admin only)
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => ordersApi.updateOrderStatus(orderId, status),
    onSuccess: (_, variables) => {
      // Invalidate order detail and orders list
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.orderId),
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
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

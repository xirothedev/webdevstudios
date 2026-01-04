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

import { apiClient } from '@/lib/api-client';

import type { Order, OrderStatus } from './orders';
import type { Product } from './products';
import { UserRole } from './users';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  avatar: string | null;
  role: UserRole;
  emailVerified: boolean;
  phoneVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateUserRequest {
  fullName?: string;
  phone?: string;
  avatar?: string;
  role?: UserRole;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  priceCurrent?: number;
  priceOriginal?: number | null;
  badge?: string | null;
  isPublished?: boolean;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
}

export type PaymentTransactionStatus =
  | 'PENDING'
  | 'PAID'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'FAILED';

export interface PaymentTransaction {
  id: string;
  orderId: string;
  transactionCode: string;
  amount: number;
  status: PaymentTransactionStatus;
  paymentUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionListResponse {
  transactions: PaymentTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const adminApi = {
  /**
   * List users with pagination and role filter (Admin only)
   */
  async listUsers(
    page: number = 1,
    limit: number = 10,
    role?: UserRole
  ): Promise<UserListResponse> {
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };
    if (role) {
      params.role = role;
    }
    const response = await apiClient.get<{ data: UserListResponse }>('/users', {
      params,
    });
    return response.data.data;
  },

  /**
   * Get user by ID (Admin only)
   */
  async getUserById(id: string): Promise<AdminUser> {
    const response = await apiClient.get<{ data: AdminUser }>(`/users/${id}`);
    return response.data.data;
  },

  /**
   * Update user (Admin only)
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<AdminUser> {
    const response = await apiClient.patch<{ data: AdminUser }>(
      `/users/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete user (Admin only)
   */
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * List all products (Admin view - includes unpublished)
   */
  async listProducts(): Promise<ProductListResponse> {
    const response = await apiClient.get<{ data: ProductListResponse }>(
      '/products'
    );
    return response.data.data;
  },

  /**
   * Update product (Admin only)
   */
  async updateProduct(
    id: string,
    data: UpdateProductRequest
  ): Promise<Product> {
    const response = await apiClient.patch<{ data: Product }>(
      `/products/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * List orders with filters (Admin only)
   */
  async listOrders(
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus
  ): Promise<OrderListResponse> {
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };
    if (status) {
      params.status = status;
    }
    const response = await apiClient.get<{ data: OrderListResponse }>(
      '/orders',
      {
        params,
      }
    );
    return response.data.data;
  },

  /**
   * List payment transactions (Admin only)
   */
  async listTransactions(
    page: number = 1,
    limit: number = 10,
    status?: PaymentTransactionStatus
  ): Promise<TransactionListResponse> {
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };
    if (status) {
      params.status = status;
    }
    const response = await apiClient.get<{ data: TransactionListResponse }>(
      '/payments/transactions',
      {
        params,
      }
    );
    return response.data.data;
  },
};

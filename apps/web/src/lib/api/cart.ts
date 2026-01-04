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

import { apiClient } from '../api-client';
import { ProductSize } from './products';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productPrice: number;
  productImage: string;
  size: ProductSize | null;
  quantity: number;
  subtotal: number;
  stockAvailable: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  size?: ProductSize;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export const cartApi = {
  /**
   * Get user's cart
   */
  async getCart(): Promise<Cart> {
    const response = await apiClient.get<{ data: Cart }>('/cart');
    return response.data.data;
  },

  /**
   * Add item to cart
   */
  async addToCart(data: AddToCartRequest): Promise<Cart> {
    const response = await apiClient.post<{ data: Cart }>('/cart/items', data);
    return response.data.data;
  },

  /**
   * Update cart item quantity
   */
  async updateCartItem(
    cartItemId: string,
    data: UpdateCartItemRequest
  ): Promise<Cart> {
    const response = await apiClient.patch<{ data: Cart }>(
      `/cart/items/${cartItemId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Remove item from cart
   */
  async removeFromCart(cartItemId: string): Promise<Cart> {
    const response = await apiClient.delete<{ data: Cart }>(
      `/cart/items/${cartItemId}`
    );
    return response.data.data;
  },

  /**
   * Clear cart
   */
  async clearCart(): Promise<Cart> {
    const response = await apiClient.delete<{ data: Cart }>('/cart');
    return response.data.data;
  },
};

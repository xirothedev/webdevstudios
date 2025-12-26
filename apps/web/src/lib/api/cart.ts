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

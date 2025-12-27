import { apiClient } from '../api-client';
import { ProductSize } from './products';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  productId: string | null;
  productSlug: string;
  productName: string;
  size: ProductSize | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  district: string;
  ward: string;
  postalCode: string;
}

export interface Order {
  id: string;
  code: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  shippingFee: number;
  discountValue: number;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export type OrderType = 'FROM_CART' | 'DIRECT_PURCHASE';

export interface CreateOrderRequest {
  shippingAddress: ShippingAddress;
  orderType?: OrderType;
  productId?: string;
  productSlug?: string;
  size?: ProductSize;
  quantity?: number;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export const ordersApi = {
  /**
   * Create order from cart
   */
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await apiClient.post<{ data: Order }>('/orders', data);
    return response.data.data;
  },

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    const response = await apiClient.get<{ data: Order }>(`/orders/${orderId}`);
    return response.data.data;
  },

  /**
   * List user's orders
   */
  async listOrders(page?: number, limit?: number): Promise<OrderListResponse> {
    const params: Record<string, string> = {};
    if (page) params.page = page.toString();
    if (limit) params.limit = limit.toString();
    const response = await apiClient.get<{ data: OrderListResponse }>(
      '/orders',
      {
        params,
      }
    );
    return response.data.data;
  },

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string): Promise<Order> {
    const response = await apiClient.patch<{ data: Order }>(
      `/orders/${orderId}/cancel`
    );
    return response.data.data;
  },

  /**
   * Update order status (Admin only)
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<Order> {
    const response = await apiClient.patch<{ data: Order }>(
      `/orders/${orderId}/status`,
      {
        status,
      }
    );
    return response.data.data;
  },
};

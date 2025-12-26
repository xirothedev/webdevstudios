import {
  Order,
  OrderItem,
  Product,
  ShippingAddress,
} from 'generated/prisma/client';

export type OrderItemWithProduct = OrderItem & {
  product: Product | null;
};

export type OrderWithItems = Order & {
  items: OrderItemWithProduct[];
  shippingAddress: ShippingAddress;
};

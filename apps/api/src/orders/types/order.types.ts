import { Order, OrderItem, Product, ShippingAddress } from '@generated/prisma';

export type OrderItemWithProduct = OrderItem & {
  product: Product | null;
};

export type OrderWithItems = Order & {
  items: OrderItemWithProduct[];
  shippingAddress: ShippingAddress;
};

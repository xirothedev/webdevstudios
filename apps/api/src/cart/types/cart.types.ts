import {
  Cart,
  CartItem,
  Product,
  ProductSizeStock,
} from 'generated/prisma/client';

export type ProductWithStock = Product & {
  sizeStocks: ProductSizeStock[];
};

export type CartItemWithProduct = CartItem & {
  product: ProductWithStock;
};

export type CartWithItems = Cart & {
  items: CartItemWithProduct[];
};

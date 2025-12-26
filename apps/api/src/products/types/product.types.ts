import { Product, ProductSizeStock } from 'generated/prisma/client';

export type ProductWithRelations = Product & {
  sizeStocks: ProductSizeStock[];
};

export type ProductSizeStockType = ProductSizeStock;

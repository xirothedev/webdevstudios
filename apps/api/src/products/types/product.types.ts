import { Product, ProductSizeStock } from '@generated/prisma';

export type ProductWithRelations = Product & {
  sizeStocks: ProductSizeStock[];
};

export type ProductSizeStockType = ProductSizeStock;

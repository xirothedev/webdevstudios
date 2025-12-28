import { ProductSize } from '@generated/prisma';

export interface SizeStockInput {
  size: ProductSize;
  stock: number;
}

export class UpdateProductSizesCommand {
  constructor(
    public readonly productId: string,
    public readonly sizeStocks: SizeStockInput[]
  ) {}
}

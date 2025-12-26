import { ProductSize } from '@generated/prisma';

export class UpdateProductStockCommand {
  constructor(
    public readonly productId: string,
    public readonly stock: number,
    public readonly size?: ProductSize
  ) {}
}

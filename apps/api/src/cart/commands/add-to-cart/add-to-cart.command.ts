import { ProductSize } from '@generated/prisma';

export class AddToCartCommand {
  constructor(
    public readonly userId: string,
    public readonly productId: string,
    public readonly size: ProductSize | null,
    public readonly quantity: number
  ) {}
}

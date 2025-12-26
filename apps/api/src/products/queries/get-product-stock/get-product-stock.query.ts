import { ProductSize, ProductSlug } from '@generated/prisma';

export class GetProductStockQuery {
  constructor(
    public readonly slug: ProductSlug,
    public readonly size?: ProductSize
  ) {}
}

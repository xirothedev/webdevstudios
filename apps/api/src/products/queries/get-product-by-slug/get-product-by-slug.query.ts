import { ProductSlug } from '@generated/prisma';

export class GetProductBySlugQuery {
  constructor(public readonly slug: ProductSlug) {}
}

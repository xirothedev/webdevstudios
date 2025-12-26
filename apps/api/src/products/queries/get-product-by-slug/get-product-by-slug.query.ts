import { ProductSlug } from 'generated/prisma/client';

export class GetProductBySlugQuery {
  constructor(public readonly slug: ProductSlug) {}
}

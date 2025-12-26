import { ProductSlug } from 'generated/prisma/client';

export class GetProductReviewsQuery {
  constructor(
    public readonly productSlug: ProductSlug,
    public readonly page: number,
    public readonly limit: number
  ) {}
}

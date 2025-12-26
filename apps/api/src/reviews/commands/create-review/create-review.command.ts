import { ProductSlug } from '@generated/prisma';

export class CreateReviewCommand {
  constructor(
    public readonly userId: string,
    public readonly productSlug: ProductSlug,
    public readonly rating: number,
    public readonly comment?: string | null
  ) {}
}

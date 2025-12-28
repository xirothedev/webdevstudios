export class UpdateProductCommand {
  constructor(
    public readonly productId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly priceCurrent?: number,
    public readonly priceOriginal?: number | null,
    public readonly badge?: string | null,
    public readonly isPublished?: boolean
  ) {}
}

export class UpdateReviewCommand {
  constructor(
    public readonly reviewId: string,
    public readonly userId: string,
    public readonly rating?: number,
    public readonly comment?: string | null
  ) {}
}

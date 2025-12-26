export class DeleteReviewCommand {
  constructor(
    public readonly reviewId: string,
    public readonly userId: string
  ) {}
}

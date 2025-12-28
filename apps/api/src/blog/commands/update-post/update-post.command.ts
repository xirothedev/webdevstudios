export class UpdateBlogPostCommand {
  constructor(
    public readonly postId: string,
    public readonly title?: string,
    public readonly content?: string,
    public readonly excerpt?: string | null,
    public readonly coverImage?: string | null,
    public readonly isPublished?: boolean,
    public readonly metaTitle?: string | null,
    public readonly metaDescription?: string | null
  ) {}
}

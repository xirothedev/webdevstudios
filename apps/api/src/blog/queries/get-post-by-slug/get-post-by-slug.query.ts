export class GetBlogPostBySlugQuery {
  constructor(
    public readonly slug: string,
    public readonly includeContent?: boolean
  ) {}
}

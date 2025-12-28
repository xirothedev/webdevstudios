export class GetBlogPostByIdQuery {
  constructor(
    public readonly postId: string,
    public readonly includeContent?: boolean
  ) {}
}

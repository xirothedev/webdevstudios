export class ListBlogPostsQuery {
  constructor(
    public readonly page?: number,
    public readonly pageSize?: number,
    public readonly isPublished?: boolean,
    public readonly authorId?: string
  ) {}
}

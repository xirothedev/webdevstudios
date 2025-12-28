export class SearchBlogPostsQuery {
  constructor(
    public readonly query: string,
    public readonly page?: number,
    public readonly pageSize?: number
  ) {}
}

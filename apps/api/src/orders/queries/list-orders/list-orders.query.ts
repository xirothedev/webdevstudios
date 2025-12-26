export class ListOrdersQuery {
  constructor(
    public readonly userId: string,
    public readonly page: number,
    public readonly limit: number
  ) {}
}

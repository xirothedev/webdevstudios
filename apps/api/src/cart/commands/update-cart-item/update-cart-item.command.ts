export class UpdateCartItemCommand {
  constructor(
    public readonly userId: string,
    public readonly cartItemId: string,
    public readonly quantity: number
  ) {}
}

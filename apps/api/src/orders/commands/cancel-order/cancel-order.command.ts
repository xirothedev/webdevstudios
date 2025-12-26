export class CancelOrderCommand {
  constructor(
    public readonly orderId: string,
    public readonly userId: string
  ) {}
}

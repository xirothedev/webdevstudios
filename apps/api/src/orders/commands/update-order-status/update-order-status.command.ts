import { OrderStatus } from 'generated/prisma/client';

export class UpdateOrderStatusCommand {
  constructor(
    public readonly orderId: string,
    public readonly status: OrderStatus,
    public readonly requesterRole: string
  ) {}
}

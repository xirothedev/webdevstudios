import { OrderStatus } from '@generated/prisma';

export class ListAllOrdersQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly status?: OrderStatus
  ) {}
}

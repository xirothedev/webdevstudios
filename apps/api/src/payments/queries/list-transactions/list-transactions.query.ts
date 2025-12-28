import { PaymentTransactionStatus } from '@generated/prisma';

export class ListTransactionsQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly status?: PaymentTransactionStatus
  ) {}
}

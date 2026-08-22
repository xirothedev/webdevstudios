import { Prisma } from '@prisma/client';

export const PAYMENT_TRANSACTION_SELECT = {
  id: true,
  orderId: true,
  transactionCode: true,
  amount: true,
  status: true,
  paymentUrl: true,
  payosData: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PaymentTransactionSelect;

export type PaymentTransactionRow = Prisma.PaymentTransactionGetPayload<{
  select: typeof PAYMENT_TRANSACTION_SELECT;
}>;

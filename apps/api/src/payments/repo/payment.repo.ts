import {
  OrderStatus,
  PaymentStatus,
  PaymentTransactionStatus,
  Prisma,
  ProductSize,
} from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma';
import { PAYMENT_TRANSACTION_SELECT, type PaymentTransactionRow } from './payment.selects';

export type PaymentTransactionWithOrder = PaymentTransactionRow & {
  order: {
    id: string;
    code: string;
    userId: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    totalAmount: Prisma.Decimal;
    items: Array<{ productId: string | null; size: ProductSize | null; quantity: number }>;
  };
};

export type TransactionListResult = {
  transactions: Array<{
    id: string;
    orderId: string;
    transactionCode: string;
    amount: Prisma.Decimal;
    status: PaymentTransactionStatus;
    paymentUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    order: { id: string; code: string; userId: string; totalAmount: Prisma.Decimal };
  }>;
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

@Injectable()
export class PaymentRepo {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    orderId: string;
    transactionCode: string;
    amount: number;
    status: PaymentTransactionStatus;
    paymentUrl?: string;
    payosData?: unknown;
  }): Promise<PaymentTransactionRow> {
    return this.prisma.paymentTransaction.create({
      data: {
        orderId: data.orderId,
        transactionCode: data.transactionCode,
        amount: data.amount,
        status: data.status,
        paymentUrl: data.paymentUrl,
        payosData: data.payosData as object,
      },
      select: PAYMENT_TRANSACTION_SELECT,
    });
  }

  async findByOrderId(orderId: string): Promise<PaymentTransactionRow | null> {
    return this.prisma.paymentTransaction.findUnique({
      where: { orderId },
      select: PAYMENT_TRANSACTION_SELECT,
    });
  }

  async findByTransactionCode(
    transactionCode: string,
  ): Promise<PaymentTransactionWithOrder | null> {
    return this.prisma.paymentTransaction.findUnique({
      where: { transactionCode },
      select: {
        ...PAYMENT_TRANSACTION_SELECT,
        order: {
          select: {
            id: true,
            code: true,
            userId: true,
            status: true,
            paymentStatus: true,
            totalAmount: true,
            items: { select: { productId: true, size: true, quantity: true } },
          },
        },
      },
    });
  }

  async updateStatus(
    id: string,
    status: PaymentTransactionStatus,
    payosData?: unknown,
  ): Promise<PaymentTransactionRow> {
    return this.prisma.paymentTransaction.update({
      where: { id },
      data: {
        status,
        payosData: payosData ? (payosData as object) : undefined,
      },
      select: PAYMENT_TRANSACTION_SELECT,
    });
  }

  async listTransactions(
    page: number = 1,
    limit: number = 10,
    status?: PaymentTransactionStatus,
  ): Promise<TransactionListResult> {
    const skip = (page - 1) * limit;

    const where: { status?: PaymentTransactionStatus } = {};
    if (status) {
      where.status = status;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.paymentTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          ...PAYMENT_TRANSACTION_SELECT,
          order: { select: { id: true, code: true, userId: true, totalAmount: true } },
        },
      }),
      this.prisma.paymentTransaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      transactions: transactions.map((transaction) => ({
        id: transaction.id,
        orderId: transaction.orderId,
        transactionCode: transaction.transactionCode,
        amount: transaction.amount,
        status: transaction.status,
        paymentUrl: transaction.paymentUrl,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        order: {
          id: transaction.order.id,
          code: transaction.order.code,
          userId: transaction.order.userId,
          totalAmount: transaction.order.totalAmount,
        },
      })),
      pagination: { page, limit, total, totalPages },
    };
  }
}

import { PaymentTransactionStatus } from '@generated/prisma';
import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { PrismaService } from '@/prisma/prisma.service';

import { ListTransactionsQuery } from './list-transactions.query';

@Injectable()
@QueryHandler(ListTransactionsQuery)
export class ListTransactionsHandler implements IQueryHandler<ListTransactionsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListTransactionsQuery) {
    const { page, limit, status } = query;

    const skip = (page - 1) * limit;

    const where: {
      status?: PaymentTransactionStatus;
    } = {};

    if (status) {
      where.status = status;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.paymentTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          order: {
            select: {
              id: true,
              code: true,
              userId: true,
              totalAmount: true,
            },
          },
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
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}

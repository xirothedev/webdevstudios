/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

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

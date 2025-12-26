import { PaymentTransactionStatus } from '@generated/prisma';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    orderId: string;
    transactionCode: string;
    amount: number;
    status: PaymentTransactionStatus;
    paymentUrl?: string;
    payosData?: unknown;
  }) {
    return this.prisma.paymentTransaction.create({
      data: {
        orderId: data.orderId,
        transactionCode: data.transactionCode,
        amount: data.amount,
        status: data.status,
        paymentUrl: data.paymentUrl,
        payosData: data.payosData as object,
      },
    });
  }

  async findByOrderId(orderId: string) {
    return this.prisma.paymentTransaction.findUnique({
      where: { orderId },
    });
  }

  async findByTransactionCode(transactionCode: string) {
    return this.prisma.paymentTransaction.findUnique({
      where: { transactionCode },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    });
  }

  async updateStatus(
    id: string,
    status: PaymentTransactionStatus,
    payosData?: unknown
  ) {
    return this.prisma.paymentTransaction.update({
      where: { id },
      data: {
        status,
        payosData: payosData ? (payosData as object) : undefined,
      },
    });
  }

  async findExpiredPendingTransactions() {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    return this.prisma.paymentTransaction.findMany({
      where: {
        status: PaymentTransactionStatus.PENDING,
        createdAt: {
          lt: fifteenMinutesAgo,
        },
      },
      include: {
        order: true,
      },
    });
  }
}

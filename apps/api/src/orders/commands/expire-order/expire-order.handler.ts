import {
  OrderStatus,
  PaymentStatus,
  PaymentTransactionStatus,
} from '@generated/prisma';
import { Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PrismaService } from '@/prisma/prisma.service';

import { OrderRepository } from '../../infrastructure/order.repository';
import { ExpireOrderCommand } from './expire-order.command';

@CommandHandler(ExpireOrderCommand)
export class ExpireOrderHandler implements ICommandHandler<ExpireOrderCommand> {
  private readonly logger = new Logger(ExpireOrderHandler.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly prisma: PrismaService
  ) {}

  async execute(command: ExpireOrderCommand): Promise<void> {
    const { orderId } = command;

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    // Check if order can be expired (idempotent check)
    if (order.status !== OrderStatus.PENDING) {
      this.logger.log(
        `Order ${orderId} cannot be expired - status is ${order.status}`
      );
      return; // Already processed, skip
    }

    if (order.paymentStatus !== PaymentStatus.PENDING) {
      this.logger.log(
        `Order ${orderId} cannot be expired - payment status is ${order.paymentStatus}`
      );
      return; // Already processed, skip
    }

    // Use Prisma transaction for atomicity
    await this.prisma.$transaction(async (tx) => {
      // Restore stock
      for (const item of order.items) {
        if (item.productId) {
          if (item.size) {
            await tx.productSizeStock.updateMany({
              where: {
                productId: item.productId,
                size: item.size,
              },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }
        }
      }

      // Update payment transaction if exists
      const paymentTransaction = await tx.paymentTransaction.findUnique({
        where: { orderId },
      });
      if (paymentTransaction) {
        await tx.paymentTransaction.update({
          where: { id: paymentTransaction.id },
          data: { status: PaymentTransactionStatus.EXPIRED },
        });
      }

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          paymentStatus: PaymentStatus.FAILED,
        },
      });
    });

    this.logger.log(
      `Order ${orderId} expired and stock restored after 15 minutes`
    );
  }
}

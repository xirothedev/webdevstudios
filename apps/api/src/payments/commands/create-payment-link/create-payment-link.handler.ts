import { PaymentTransactionStatus } from '@generated/prisma';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OrderRepository } from '@/orders/infrastructure/order.repository';

import { PaymentRepository } from '../../infrastructure/payment.repository';
import { PayOSService } from '../../services/payos.service';
import { CreatePaymentLinkCommand } from './create-payment-link.command';

@CommandHandler(CreatePaymentLinkCommand)
export class CreatePaymentLinkHandler implements ICommandHandler<CreatePaymentLinkCommand> {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly payOSService: PayOSService
  ) {}

  async execute(command: CreatePaymentLinkCommand): Promise<{
    paymentUrl: string;
    transactionCode: string;
  }> {
    const { orderId } = command;

    // Find order
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    // Check if order is already paid
    if (order.paymentStatus === 'PAID') {
      throw new ConflictException('Order is already paid');
    }

    // Check if payment transaction already exists
    const existingTransaction =
      await this.paymentRepository.findByOrderId(orderId);
    if (existingTransaction) {
      // If transaction exists and is pending, return existing payment URL
      if (existingTransaction.status === PaymentTransactionStatus.PENDING) {
        if (existingTransaction.paymentUrl) {
          return {
            paymentUrl: existingTransaction.paymentUrl,
            transactionCode: existingTransaction.transactionCode,
          };
        }
      } else {
        throw new ConflictException(
          'Payment transaction already exists for this order'
        );
      }
    }

    // Get return and cancel URLs from config
    const returnUrl = process.env.PAYOS_RETURN_URL || '';
    const cancelUrl = process.env.PAYOS_CANCEL_URL || '';

    if (!returnUrl || !cancelUrl) {
      throw new BadRequestException(
        'PAYOS_RETURN_URL and PAYOS_CANCEL_URL must be configured'
      );
    }

    // Prepare payment items
    const items = order.items.map((item) => ({
      name: item.productName,
      quantity: item.quantity,
      price: Number(item.price),
    }));

    // Convert order code to numeric for PayOS
    // Our order code is like "#ORD-1234", PayOS needs a number
    // Extract numeric part or use a hash of the order ID
    const orderCodeForPayOS = this.convertOrderCodeToNumber(order.code);

    // Create payment link with PayOS
    const { paymentUrl, transactionCode } =
      await this.payOSService.createPaymentLink({
        orderCode: orderCodeForPayOS.toString(),
        amount: Number(order.totalAmount),
        description: `Thanh toán đơn hàng ${order.code}`,
        returnUrl,
        cancelUrl,
        items,
      });

    // Save payment transaction
    await this.paymentRepository.create({
      orderId: order.id,
      transactionCode,
      amount: Number(order.totalAmount),
      status: PaymentTransactionStatus.PENDING,
      paymentUrl,
    });

    return { paymentUrl, transactionCode };
  }

  private convertOrderCodeToNumber(orderCode: string): number {
    // Extract numeric part from order code like "#ORD-1234"
    // If format is "#ORD-1234", extract "1234"
    const match = orderCode.match(/\d+$/);
    if (match) {
      return parseInt(match[0], 10);
    }
    // Fallback: use hash of order code to generate a number
    let hash = 0;
    for (let i = 0; i < orderCode.length; i++) {
      const char = orderCode.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Ensure positive number and within PayOS range
    return Math.abs(hash) % 1000000000; // Max 9 digits
  }
}

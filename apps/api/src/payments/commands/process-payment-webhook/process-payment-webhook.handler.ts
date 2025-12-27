import {
  OrderStatus,
  PaymentStatus,
  PaymentTransactionStatus,
} from '@generated/prisma';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SecurityLoggerService } from '@/common/services/security-logger.service';
import { OrderRepository } from '@/orders/infrastructure/order.repository';
import { ProductRepository } from '@/products/infrastructure/product.repository';

import { PaymentRepository } from '../../infrastructure/payment.repository';
import { PayOSService } from '../../services/payos.service';
import { ProcessPaymentWebhookCommand } from './process-payment-webhook.command';

@CommandHandler(ProcessPaymentWebhookCommand)
export class ProcessPaymentWebhookHandler implements ICommandHandler<ProcessPaymentWebhookCommand> {
  private readonly logger = new Logger(ProcessPaymentWebhookHandler.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly payOSService: PayOSService,
    private readonly securityLogger: SecurityLoggerService
  ) {}

  async execute(command: ProcessPaymentWebhookCommand): Promise<void> {
    const { webhookData } = command;

    // Verify webhook signature - this will throw if invalid
    let verifiedData;
    try {
      verifiedData = await this.payOSService.verifyWebhook(webhookData);
    } catch (error) {
      // For test webhooks during URL verification, PayOS might send invalid signatures
      // Check if this looks like a test webhook
      const paymentLinkId = webhookData.data?.paymentLinkId;
      if (
        !paymentLinkId ||
        paymentLinkId === 'test' ||
        paymentLinkId.includes('test')
      ) {
        this.logger.log('Test webhook received - URL verification successful');
        return; // Return success for test webhooks
      }

      // Log webhook signature failure for security monitoring (A08: Data Integrity)
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(`Invalid webhook signature: ${errorMessage}`);
      await this.securityLogger.logWebhookSignatureFailure(
        '/v1/payments/webhook',
        undefined // IP address not available in handler context
      );

      throw new BadRequestException('Invalid webhook signature');
    }

    // Extract data from verified webhook
    const paymentData = verifiedData.data as {
      orderCode: number | string;
      amount: number;
      description: string;
      accountNumber: string;
      reference: string;
      transactionDateTime: string;
      currency: string;
      paymentLinkId: string;
      code: string;
      desc: string;
    };

    // Find payment transaction by paymentLinkId (PayOS transaction identifier)
    const paymentTransaction =
      await this.paymentRepository.findByTransactionCode(
        paymentData.paymentLinkId
      );

    if (!paymentTransaction) {
      // This might be a test webhook from PayOS for URL verification
      // Log but don't throw error - let controller handle gracefully
      this.logger.warn(
        `Payment transaction not found: ${paymentData.paymentLinkId}. This might be a test webhook.`
      );
      // For test webhooks, we should still return success to verify URL
      // Check if this looks like a test webhook (no real orderCode match)
      if (!paymentData.paymentLinkId || paymentData.paymentLinkId === 'test') {
        this.logger.log('Test webhook received - URL verification successful');
        return;
      }
      throw new NotFoundException('Payment transaction not found');
    }

    const order = paymentTransaction.order;
    if (!order) {
      throw new NotFoundException('Order not found for payment transaction');
    }

    // Check if already processed (idempotency)
    if (paymentTransaction.status === PaymentTransactionStatus.PAID) {
      this.logger.log(`Payment already processed: ${paymentData.orderCode}`);
      return;
    }

    // Process based on webhook code
    // PayOS webhook codes: 00 = success, others = failed/cancelled
    const isSuccess = paymentData.code === '00' || verifiedData.code === '00';

    if (isSuccess) {
      // Payment successful
      await this.paymentRepository.updateStatus(
        paymentTransaction.id,
        PaymentTransactionStatus.PAID,
        verifiedData
      );

      await this.orderRepository.updatePaymentStatus(
        order.id,
        PaymentStatus.PAID
      );

      await this.orderRepository.updateStatus(order.id, OrderStatus.CONFIRMED);

      this.logger.log(
        `Payment successful for order ${order.code}, orderCode ${paymentData.orderCode}`
      );
    } else {
      // Payment failed or cancelled
      await this.paymentRepository.updateStatus(
        paymentTransaction.id,
        PaymentTransactionStatus.FAILED,
        verifiedData
      );

      await this.orderRepository.updatePaymentStatus(
        order.id,
        PaymentStatus.FAILED
      );

      await this.orderRepository.updateStatus(order.id, OrderStatus.CANCELLED);

      // Restore stock
      for (const item of order.items) {
        if (item.productId) {
          if (item.size) {
            await this.productRepository.incrementSizeStock(
              item.productId,
              item.size,
              item.quantity
            );
          } else {
            await this.productRepository.incrementStock(
              item.productId,
              item.quantity
            );
          }
        }
      }

      this.logger.log(
        `Payment failed for order ${order.code}, orderCode ${paymentData.orderCode}. Stock restored.`
      );
    }
  }
}

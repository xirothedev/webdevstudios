import { PaymentTransactionStatus, OrderStatus, PaymentStatus } from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { SecurityLoggerService } from '@/common/services';
import { OrderRepo } from '@/orders/repo';
import { ProductRepo } from '@/products/repo';

import { TransactionListResponseDto } from '../dto/payment.dto';
import { PaymentRepo } from '../repo';
import { PayOSService } from './payos.service';

export type PayOSWebhookBody = {
  code: string;
  desc: string;
  success: boolean;
  data: {
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
    [key: string]: unknown;
  };
  signature: string;
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly paymentRepo: PaymentRepo,
    private readonly orderRepo: OrderRepo,
    private readonly productRepo: ProductRepo,
    private readonly payOSService: PayOSService,
    private readonly securityLogger: SecurityLoggerService,
  ) {}

  async createPaymentLink(orderId: string): Promise<{
    paymentUrl: string;
    transactionCode: string;
  }> {
    // Find order
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    // Check if order is already paid
    if (order.paymentStatus === 'PAID') {
      throw new ConflictException('Order is already paid');
    }

    // Check if payment transaction already exists
    const existingTransaction = await this.paymentRepo.findByOrderId(orderId);
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
        throw new ConflictException('Payment transaction already exists for this order');
      }
    }

    // Get return and cancel URLs from config
    const returnUrl = process.env.PAYOS_RETURN_URL || '';
    const cancelUrl = process.env.PAYOS_CANCEL_URL || '';

    if (!returnUrl || !cancelUrl) {
      throw new BadRequestException('PAYOS_RETURN_URL and PAYOS_CANCEL_URL must be configured');
    }

    // Prepare payment items
    const items = order.items.map((item) => ({
      name: item.productName,
      quantity: item.quantity,
      price: Number(item.price),
    }));

    const orderCodeForPayOS = this.convertOrderCodeToNumber(order.code);

    const { paymentUrl, transactionCode } = await this.payOSService.createPaymentLink({
      orderCode: orderCodeForPayOS.toString(),
      amount: Number(order.totalAmount),
      description: `Thanh toán đơn hàng ${order.code}`,
      returnUrl,
      cancelUrl,
      items,
    });

    // Save payment transaction
    await this.paymentRepo.create({
      orderId: order.id,
      transactionCode,
      amount: Number(order.totalAmount),
      status: PaymentTransactionStatus.PENDING,
      paymentUrl,
    });

    return { paymentUrl, transactionCode };
  }

  async processWebhook(webhookData: PayOSWebhookBody): Promise<void> {
    // Verify webhook signature - this will throw if invalid
    let verifiedData;
    try {
      verifiedData = await this.payOSService.verifyWebhook(webhookData);
    } catch (error) {
      // For test webhooks during URL verification, PayOS might send invalid signatures
      // Check if this looks like a test webhook
      const paymentLinkId = webhookData.data?.paymentLinkId as string | undefined;
      if (!paymentLinkId || paymentLinkId === 'test' || paymentLinkId.includes('test')) {
        this.logger.log('Test webhook received - URL verification successful');
        return; // Return success for test webhooks
      }

      // Log webhook signature failure for security monitoring (A08: Data Integrity)
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Invalid webhook signature: ${errorMessage}`);
      await this.securityLogger.logWebhookSignatureFailure(
        '/v1/payments/webhook',
        undefined, // IP address not available in handler context
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
    const paymentTransaction = await this.paymentRepo.findByTransactionCode(
      paymentData.paymentLinkId,
    );
    if (!paymentTransaction) {
      // This might be a test webhook from PayOS for URL verification
      // Log but don't throw error - let controller handle gracefully
      this.logger.warn(
        `Payment transaction not found: ${paymentData.paymentLinkId}. This might be a test webhook.`,
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
      await this.paymentRepo.updateStatus(
        paymentTransaction.id,
        PaymentTransactionStatus.PAID,
        verifiedData,
      );

      await this.orderRepo.updatePaymentStatus(order.id, PaymentStatus.PAID);

      await this.orderRepo.updateStatus(order.id, OrderStatus.CONFIRMED);

      this.logger.log(
        `Payment successful for order ${order.code}, orderCode ${paymentData.orderCode}`,
      );
    } else {
      // Payment failed or cancelled
      await this.paymentRepo.updateStatus(
        paymentTransaction.id,
        PaymentTransactionStatus.FAILED,
        verifiedData,
      );

      await this.orderRepo.updatePaymentStatus(order.id, PaymentStatus.FAILED);

      await this.orderRepo.updateStatus(order.id, OrderStatus.CANCELLED);

      // Restore stock
      for (const item of order.items) {
        if (item.productId) {
          if (item.size) {
            await this.productRepo.incrementSizeStock(item.productId, item.size, item.quantity);
          } else {
            await this.productRepo.incrementStock(item.productId, item.quantity);
          }
        }
      }

      this.logger.log(
        `Payment failed for order ${order.code}, orderCode ${paymentData.orderCode}. Stock restored.`,
      );
    }
  }

  async listTransactions(
    page: number,
    limit: number,
    status?: PaymentTransactionStatus,
  ): Promise<TransactionListResponseDto> {
    // ponytail: raw Decimal passthrough kept verbatim from the old query handler
    return this.paymentRepo.listTransactions(
      page,
      limit,
      status,
    ) as unknown as TransactionListResponseDto;
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

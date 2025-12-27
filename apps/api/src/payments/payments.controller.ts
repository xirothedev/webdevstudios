import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Public } from '@/common/decorators/public.decorator';
import {
  ThrottleAPI,
  ThrottlePayment,
} from '@/common/decorators/throttle.decorator';

import { CreatePaymentLinkCommand } from './commands/create-payment-link/create-payment-link.command';
import { ProcessPaymentWebhookCommand } from './commands/process-payment-webhook/process-payment-webhook.command';
import {
  CreatePaymentLinkRequestDto,
  PaymentLinkResponseDto,
  WebhookDto,
} from './dtos/payment.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @ThrottlePayment()
  @Post('create-link')
  @ApiOperation({
    summary: 'Create payment link for order',
    description: 'Create a PayOS payment link for an order',
  })
  @ApiBody({ type: CreatePaymentLinkRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Payment link created successfully',
    type: PaymentLinkResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 409, description: 'Order already paid' })
  async createPaymentLink(
    @Body() dto: CreatePaymentLinkRequestDto
  ): Promise<PaymentLinkResponseDto> {
    const result = await this.commandBus.execute(
      new CreatePaymentLinkCommand(dto.orderId)
    );

    return {
      paymentUrl: result.paymentUrl,
      transactionCode: result.transactionCode,
    };
  }

  @Post('webhook')
  @Public()
  @ApiOperation({
    summary: 'PayOS webhook endpoint',
    description:
      'Receives webhook notifications from PayOS about payment status. This endpoint is public and does not require authentication.',
  })
  @ApiBody({ type: WebhookDto })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleWebhook(
    @Body()
    webhookData: {
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
        counterAccountBankId?: string;
        counterAccountBankName?: string;
        counterAccountName?: string;
        counterAccountNumber?: string;
        virtualAccountName?: string;
        virtualAccountNumber?: string;
      };
      signature: string;
    }
  ): Promise<{ success: boolean }> {
    try {
      // PayOS webhook includes signature in the body
      await this.commandBus.execute(
        new ProcessPaymentWebhookCommand(webhookData)
      );

      this.logger.log(
        `Webhook processed successfully for paymentLinkId: ${webhookData.data?.paymentLinkId || 'unknown'}`
      );

      return { success: true };
    } catch (error) {
      // Log error but return 200 to PayOS to prevent retries for invalid webhooks
      // This is important for webhook URL verification
      this.logger.error(
        `Webhook processing failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined
      );

      // For webhook URL verification, PayOS expects 200 response
      // Even if we can't process the webhook, we should return 200
      // to confirm the endpoint is reachable
      return { success: false };
    }
  }

  @ThrottleAPI()
  @Get('verify/:transactionCode')
  @ApiOperation({
    summary: 'Verify payment status',
    description: 'Verify payment status by transaction code',
  })
  @ApiParam({
    name: 'transactionCode',
    description: 'PayOS transaction code',
    example: '1234567890',
  })
  @ApiResponse({ status: 200, description: 'Payment status retrieved' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async verifyPayment(@Param('transactionCode') transactionCode: string) {
    // This can be implemented as a query if needed
    // For now, return basic info
    return { transactionCode, message: 'Use order endpoint to check status' };
  }
}

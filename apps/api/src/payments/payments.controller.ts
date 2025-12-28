import { UserRole } from '@generated/prisma';
import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import {
  ThrottleAPI,
  ThrottlePayment,
} from '@/common/decorators/throttle.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';

import { CreatePaymentLinkCommand } from './commands/create-payment-link/create-payment-link.command';
import { ProcessPaymentWebhookCommand } from './commands/process-payment-webhook/process-payment-webhook.command';
import {
  CreatePaymentLinkRequestDto,
  PaymentLinkResponseDto,
  TransactionListResponseDto,
  WebhookDto,
} from './dtos/payment.dto';
import { ListTransactionsQuery } from './queries/list-transactions/list-transactions.query';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

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

  @Get('transactions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List payment transactions (Admin only)',
    description:
      'Get a paginated list of all payment transactions. Admin only endpoint.',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    example: 1,
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    example: 10,
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter by transaction status',
    enum: ['PENDING', 'PAID', 'CANCELLED', 'EXPIRED', 'FAILED'],
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    type: TransactionListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async listTransactions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string
  ): Promise<TransactionListResponseDto> {
    return this.queryBus.execute(
      new ListTransactionsQuery(
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 10,
        status as any
      )
    );
  }
}

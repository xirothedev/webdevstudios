import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { CreatePaymentLinkHandler } from './commands/create-payment-link/create-payment-link.handler';
import { ProcessPaymentWebhookHandler } from './commands/process-payment-webhook/process-payment-webhook.handler';
import { PaymentRepository } from './infrastructure/payment.repository';
import { PaymentsController } from './payments.controller';
import { PayOSService } from './services/payos.service';

const CommandHandlers = [
  CreatePaymentLinkHandler,
  ProcessPaymentWebhookHandler,
];

@Module({
  imports: [CqrsModule, OrdersModule, ProductsModule],
  controllers: [PaymentsController],
  providers: [...CommandHandlers, PaymentRepository, PayOSService],
  exports: [PaymentRepository, PayOSService],
})
export class PaymentsModule {}

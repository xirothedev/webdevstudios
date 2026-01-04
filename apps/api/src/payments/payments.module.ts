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

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { CreatePaymentLinkHandler } from './commands/create-payment-link/create-payment-link.handler';
import { ProcessPaymentWebhookHandler } from './commands/process-payment-webhook/process-payment-webhook.handler';
import { PaymentRepository } from './infrastructure/payment.repository';
import { PaymentsController } from './payments.controller';
import { ListTransactionsHandler } from './queries/list-transactions/list-transactions.handler';
import { PayOSService } from './services/payos.service';

const CommandHandlers = [
  CreatePaymentLinkHandler,
  ProcessPaymentWebhookHandler,
];

const QueryHandlers = [ListTransactionsHandler];

@Module({
  imports: [CqrsModule, OrdersModule, ProductsModule],
  controllers: [PaymentsController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    PaymentRepository,
    PayOSService,
  ],
  exports: [PaymentRepository, PayOSService],
})
export class PaymentsModule {}

import { Module } from '@nestjs/common';

import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { PaymentsController } from './payments.controller';
import { PaymentRepo } from './repo';
import { PaymentsService } from './services/payments.service';
import { PayOSService } from './services/payos.service';

@Module({
  imports: [OrdersModule, ProductsModule],
  controllers: [PaymentsController],
  providers: [PaymentRepo, PaymentsService, PayOSService],
  exports: [PaymentRepo, PaymentsService, PayOSService],
})
export class PaymentsModule {}

import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Cron, CronExpression } from '@nestjs/schedule';

import { ExpireOrderCommand } from '../commands/expire-order/expire-order.command';
import { OrderRepository } from '../infrastructure/order.repository';

@Injectable()
export class OrderExpirationScheduler {
  private readonly logger = new Logger(OrderExpirationScheduler.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly commandBus: CommandBus
  ) {}

  // Run every 5 minutes to check for expired orders
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredOrders() {
    this.logger.log('Checking for expired orders...');

    try {
      const expiredOrders =
        await this.orderRepository.findExpiredPendingOrders();

      if (expiredOrders.length === 0) {
        this.logger.debug('No expired orders found');
        return;
      }

      this.logger.log(`Found ${expiredOrders.length} expired orders`);

      // Process each expired order
      for (const order of expiredOrders) {
        try {
          await this.commandBus.execute(new ExpireOrderCommand(order.id));
          this.logger.log(`Expired order ${order.id} (${order.code})`);
        } catch (error) {
          this.logger.error(
            `Failed to expire order ${order.id}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Error in order expiration scheduler: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

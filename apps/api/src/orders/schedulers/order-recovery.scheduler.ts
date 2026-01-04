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

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Cron, CronExpression } from '@nestjs/schedule';

import { ExpireOrderCommand } from '../commands/expire-order/expire-order.command';
import { OrderRepository } from '../infrastructure/order.repository';

@Injectable()
export class OrderRecoveryScheduler implements OnModuleInit {
  private readonly logger = new Logger(OrderRecoveryScheduler.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly commandBus: CommandBus
  ) {}

  // Run on module init (app startup)
  async onModuleInit() {
    this.logger.log('Running order recovery on startup...');
    await this.recoverStuckOrders();
  }

  // Also run periodically every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleRecovery() {
    await this.recoverStuckOrders();
  }

  private async recoverStuckOrders() {
    try {
      const expiredOrders =
        await this.orderRepository.findExpiredPendingOrders();

      if (expiredOrders.length === 0) {
        this.logger.debug('No stuck orders found');
        return;
      }

      this.logger.log(`Found ${expiredOrders.length} stuck orders to recover`);

      // Process each stuck order
      for (const order of expiredOrders) {
        try {
          await this.commandBus.execute(new ExpireOrderCommand(order.id));
          this.logger.log(`Recovered stuck order ${order.id} (${order.code})`);
        } catch (error) {
          this.logger.error(
            `Failed to recover order ${order.id}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Error in order recovery scheduler: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

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

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';

import { CreatePaymentLinkDto } from '../dtos/payment.dto';

@Injectable()
export class PayOSService {
  private readonly logger = new Logger(PayOSService.name);
  private readonly payOS: PayOS;

  constructor(private readonly configService: ConfigService) {
    const clientId = this.configService.getOrThrow<string>('PAYOS_CLIENT_ID');
    const apiKey = this.configService.getOrThrow<string>('PAYOS_API_KEY');
    const checksumKey =
      this.configService.getOrThrow<string>('PAYOS_CHECKSUM_KEY');

    this.payOS = new PayOS({
      clientId,
      apiKey,
      checksumKey,
    });
  }

  async createPaymentLink(data: CreatePaymentLinkDto): Promise<{
    paymentUrl: string;
    transactionCode: string;
  }> {
    try {
      // Convert orderCode to number if it's a string (remove # prefix)
      const orderCodeNum =
        typeof data.orderCode === 'string'
          ? parseInt(data.orderCode.replace('#', ''), 10)
          : data.orderCode;

      const response = await this.payOS.paymentRequests.create({
        orderCode: orderCodeNum,
        amount: data.amount,
        description: data.description,
        returnUrl: data.returnUrl,
        cancelUrl: data.cancelUrl,
        items: data.items,
      });

      // PayOS returns paymentLinkId, not transactionCode
      // Use paymentLinkId as transactionCode for our system
      const transactionCode =
        response.paymentLinkId || String(response.orderCode);

      this.logger.log(
        `Payment link created: ${transactionCode} for order ${data.orderCode}`
      );

      return {
        paymentUrl: response.checkoutUrl,
        transactionCode,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create payment link: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  async verifyWebhook(webhookData: {
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
  }): Promise<unknown> {
    try {
      // PayOS webhook verification using webhooks.verify()
      // This will throw an error if signature is invalid
      // Cast to any to work around type issues - PayOS SDK will validate signature
      const verifiedData = await this.payOS.webhooks.verify(webhookData as any);
      return verifiedData;
    } catch (error) {
      this.logger.error(
        `Webhook verification failed: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  async getPaymentInfo(orderCode: number | string): Promise<unknown> {
    try {
      // Get payment link information by order code
      // PayOS API accepts either number (orderCode) or string (paymentLinkId)
      const orderCodeNum =
        typeof orderCode === 'string'
          ? parseInt(orderCode.replace('#', ''), 10)
          : orderCode;
      const paymentInfo = await this.payOS.paymentRequests.get(orderCodeNum);
      return paymentInfo;
    } catch (error) {
      this.logger.error(
        `Failed to get payment info: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }
}

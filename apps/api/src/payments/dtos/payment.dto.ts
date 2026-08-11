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

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentLinkDto {
  @ApiProperty({
    description: 'Order code',
    example: '#ORD-1234',
  })
  orderCode: string;

  @ApiProperty({
    description: 'Amount in VND',
    example: 897000,
    type: Number,
  })
  amount: number;

  @ApiProperty({
    description: 'Payment description',
    example: 'Thanh toán đơn hàng #ORD-1234',
  })
  description: string;

  @ApiProperty({
    description: 'Return URL after payment',
    example: 'https://yourdomain.com/payments/return',
  })
  returnUrl: string;

  @ApiProperty({
    description: 'Cancel URL if payment is cancelled',
    example: 'https://yourdomain.com/payments/cancel',
  })
  cancelUrl: string;

  @ApiPropertyOptional({
    description: 'Payment items',
    type: Array,
  })
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export class CreatePaymentLinkRequestDto {
  @ApiProperty({
    description: 'Order ID',
    example: 'clx1234567890',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;
}

export class PaymentLinkResponseDto {
  @ApiProperty({
    description: 'Payment URL',
    example: 'https://pay.payos.vn/web/...',
  })
  paymentUrl: string;

  @ApiProperty({
    description: 'Transaction code from PayOS',
    example: '1234567890',
  })
  transactionCode: string;
}

export class WebhookDto {
  @ApiProperty({
    description: 'Webhook code',
  })
  code: string;

  @ApiProperty({
    description: 'Transaction code',
  })
  transactionCode: string;

  @ApiProperty({
    description: 'Order code',
  })
  orderCode: string;

  @ApiProperty({
    description: 'Amount',
    type: Number,
  })
  amount: number;

  @ApiProperty({
    description: 'Description',
  })
  description: string;

  @ApiProperty({
    description: 'Account number',
  })
  accountNumber: string;

  @ApiProperty({
    description: 'Reference',
  })
  reference: string;

  @ApiProperty({
    description: 'Transaction date time',
  })
  transactionDateTime: string;

  @ApiProperty({
    description: 'Currency',
  })
  currency: string;

  @ApiProperty({
    description: 'Payment link ID',
  })
  paymentLinkId: string;

  @ApiProperty({
    description: 'Desc',
  })
  desc: string;

  @ApiProperty({
    description: 'Counter account bank ID',
  })
  counterAccountBankId?: string;

  @ApiProperty({
    description: 'Counter account bank name',
  })
  counterAccountBankName?: string;

  @ApiProperty({
    description: 'Counter account name',
  })
  counterAccountName?: string;

  @ApiProperty({
    description: 'Counter account number',
  })
  counterAccountNumber?: string;

  @ApiProperty({
    description: 'Virtual account name',
  })
  virtualAccountName?: string;

  @ApiProperty({
    description: 'Virtual account number',
  })
  virtualAccountNumber?: string;
}

export class TransactionDto {
  @ApiProperty({
    description: 'Transaction ID',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Order ID',
    example: 'clx1234567890',
  })
  orderId: string;

  @ApiProperty({
    description: 'Transaction code from PayOS',
    example: '1234567890',
  })
  transactionCode: string;

  @ApiProperty({
    description: 'Transaction amount',
    example: 897000,
    type: Number,
  })
  amount: number;

  @ApiProperty({
    description: 'Transaction status',
    enum: ['PENDING', 'PAID', 'CANCELLED', 'EXPIRED', 'FAILED'],
    example: 'PENDING',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Payment URL',
    example: 'https://pay.payos.vn/web/...',
    nullable: true,
  })
  paymentUrl: string | null;

  @ApiProperty({
    description: 'Created at',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Order information',
  })
  order: {
    id: string;
    code: string;
    userId: string;
    totalAmount: number;
  };
}

export class TransactionListResponseDto {
  @ApiProperty({
    description: 'List of transactions',
    type: [TransactionDto],
  })
  transactions: TransactionDto[];

  @ApiProperty({
    description: 'Pagination metadata',
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

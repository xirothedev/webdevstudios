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

import {
  OrderStatus,
  PaymentStatus,
  ProductSize,
  ProductSlug,
} from '@generated/prisma';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { ShippingAddressDto } from '../dtos/order.dto';
import { OrderWithItems } from '../types/order.types';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    code: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    totalAmount: number;
    shippingFee: number;
    discountValue: number;
    shippingAddress: ShippingAddressDto;
    items: Array<{
      productId: string | null;
      productSlug: ProductSlug;
      productName: string;
      size: ProductSize | null;
      price: number;
      quantity: number;
    }>;
  }): Promise<OrderWithItems> {
    // Create shipping address first
    const shippingAddress = await this.prisma.shippingAddress.create({
      data: {
        fullName: data.shippingAddress.fullName,
        phone: data.shippingAddress.phone,
        addressLine1: data.shippingAddress.addressLine1,
        addressLine2: data.shippingAddress.addressLine2,
        city: data.shippingAddress.city,
        district: data.shippingAddress.district,
        ward: data.shippingAddress.ward,
        postalCode: data.shippingAddress.postalCode,
      },
    });

    // Then create order with shippingAddressId
    const result = await this.prisma.order.create({
      data: {
        userId: data.userId,
        code: data.code,
        status: data.status,
        paymentStatus: data.paymentStatus,
        totalAmount: data.totalAmount,
        shippingFee: data.shippingFee,
        discountValue: data.discountValue,
        shippingAddressId: shippingAddress.id,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            productSlug: item.productSlug,
            productName: item.productName,
            size: item.size,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: { id: 'asc' },
        },
        shippingAddress: true,
      },
    });
    return result;
  }

  async findById(id: string): Promise<OrderWithItems | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: { id: 'asc' },
        },
        shippingAddress: true,
      },
    });
  }

  async findByCode(code: string): Promise<OrderWithItems | null> {
    return this.prisma.order.findUnique({
      where: { code },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: { id: 'asc' },
        },
        shippingAddress: true,
      },
    });
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ orders: OrderWithItems[]; total: number }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
            orderBy: { id: 'asc' },
          },
          shippingAddress: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({
        where: { userId },
      }),
    ]);

    return { orders, total };
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderWithItems> {
    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: { id: 'asc' },
        },
        shippingAddress: true,
      },
    });
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus
  ): Promise<OrderWithItems> {
    return this.prisma.order.update({
      where: { id },
      data: { paymentStatus },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: { id: 'asc' },
        },
        shippingAddress: true,
      },
    });
  }

  async generateOrderCode(): Promise<string> {
    // Generate order code like #ORD-1234
    const prefix = 'ORD';
    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    const code = `#${prefix}-${randomNum}`;

    // Check if code exists
    const existing = await this.findByCode(code);
    if (existing) {
      // Retry with new random number
      return this.generateOrderCode();
    }

    return code;
  }

  async findPendingOrdersByUserId(userId: string): Promise<OrderWithItems[]> {
    return this.prisma.order.findMany({
      where: {
        userId,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: { id: 'asc' },
        },
        shippingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findExpiredPendingOrders(): Promise<OrderWithItems[]> {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    return this.prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        createdAt: {
          lt: fifteenMinutesAgo,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: { id: 'asc' },
        },
        shippingAddress: true,
      },
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus
  ): Promise<OrderWithItems[]> {
    const skip = (page - 1) * limit;

    const where: { status?: OrderStatus } = {};
    if (status) {
      where.status = status;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: { id: 'asc' },
        },
        shippingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }

  async countAll(status?: OrderStatus): Promise<number> {
    const where: { status?: OrderStatus } = {};
    if (status) {
      where.status = status;
    }

    return this.prisma.order.count({ where });
  }
}

import { OrderStatus, PaymentStatus, Prisma, ProductSize, ProductSlug } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { subMinutes } from 'date-fns';

import { PrismaService } from '@/prisma';
import { ORDER_SELECT, type OrderRow } from './order.selects';

export type { OrderRow } from './order.selects';

@Injectable()
export class OrderRepo {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, tx?: Prisma.TransactionClient): Promise<OrderRow | null> {
    return (tx ?? this.prisma).order.findUnique({ where: { id }, select: ORDER_SELECT });
  }

  async findByCode(code: string, tx?: Prisma.TransactionClient): Promise<OrderRow | null> {
    return (tx ?? this.prisma).order.findUnique({ where: { code }, select: ORDER_SELECT });
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ orders: OrderRow[]; total: number }> {
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        select: ORDER_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return { orders, total };
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    status?: OrderStatus,
  ): Promise<OrderRow[]> {
    const where: { status?: OrderStatus } = {};
    if (status) {
      where.status = status;
    }

    return this.prisma.order.findMany({
      where,
      select: ORDER_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async countAll(status?: OrderStatus): Promise<number> {
    const where: { status?: OrderStatus } = {};
    if (status) {
      where.status = status;
    }

    return this.prisma.order.count({ where });
  }

  async findPendingOrdersByUserId(userId: string): Promise<OrderRow[]> {
    return this.prisma.order.findMany({
      where: { userId, status: OrderStatus.PENDING, paymentStatus: PaymentStatus.PENDING },
      select: ORDER_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findExpiredPendingOrders(): Promise<OrderRow[]> {
    const fifteenMinutesAgo = subMinutes(new Date(), 15);

    return this.prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        createdAt: { lt: fifteenMinutesAgo },
      },
      select: ORDER_SELECT,
    });
  }

  async generateOrderCode(tx?: Prisma.TransactionClient): Promise<string> {
    // Generate order code like #ORD-1234
    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    const code = `#ORD-${randomNum}`;

    const existing = await this.findByCode(code, tx);
    if (existing) {
      // Retry with new random number
      return this.generateOrderCode(tx);
    }

    return code;
  }

  async create(
    data: {
      userId: string;
      code: string;
      status: OrderStatus;
      paymentStatus: PaymentStatus;
      totalAmount: number;
      shippingFee: number;
      discountValue: number;
      shippingAddress: {
        fullName: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string | null;
        city: string;
        district: string;
        ward: string;
        postalCode: string;
      };
      items: Array<{
        productId: string | null;
        productSlug: ProductSlug;
        productName: string;
        size: ProductSize | null;
        price: number;
        quantity: number;
      }>;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<OrderRow> {
    const db = tx ?? this.prisma;

    const shippingAddressRecord = await db.shippingAddress.create({
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

    return db.order.create({
      data: {
        userId: data.userId,
        code: data.code,
        status: data.status,
        paymentStatus: data.paymentStatus,
        totalAmount: data.totalAmount,
        shippingFee: data.shippingFee,
        discountValue: data.discountValue,
        shippingAddressId: shippingAddressRecord.id,
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
      select: ORDER_SELECT,
    });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderRow> {
    return this.prisma.order.update({ where: { id }, data: { status }, select: ORDER_SELECT });
  }

  async cancelPending(id: string): Promise<number> {
    const res = await this.prisma.order.updateMany({
      where: { id, status: OrderStatus.PENDING },
      data: { status: OrderStatus.CANCELLED },
    });
    return res.count;
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<OrderRow> {
    return this.prisma.order.update({
      where: { id },
      data: { paymentStatus },
      select: ORDER_SELECT,
    });
  }
}

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

import { UserRole } from '@generated/prisma';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OrderDto } from '../../dtos/order.dto';
import { OrderRepository } from '../../infrastructure/order.repository';
import { OrderWithItems } from '../../types/order.types';
import { UpdateOrderStatusCommand } from './update-order-status.command';

@CommandHandler(UpdateOrderStatusCommand)
export class UpdateOrderStatusHandler implements ICommandHandler<UpdateOrderStatusCommand> {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(command: UpdateOrderStatusCommand): Promise<OrderDto> {
    const { orderId, status, requesterRole } = command;

    // Only admin can update order status
    if (requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admin can update order status');
    }

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    const updatedOrder = await this.orderRepository.updateStatus(
      orderId,
      status
    );

    // If order is confirmed, update payment status to PAID
    if (status === 'CONFIRMED' && updatedOrder.paymentStatus === 'PENDING') {
      await this.orderRepository.updatePaymentStatus(orderId, 'PAID');
      const finalOrder = await this.orderRepository.findById(orderId);
      return this.mapToDto(finalOrder!);
    }

    return this.mapToDto(updatedOrder);
  }

  private mapToDto(order: OrderWithItems): OrderDto {
    return {
      id: order.id,
      code: order.code,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: Number(order.totalAmount),
      shippingFee: Number(order.shippingFee),
      discountValue: Number(order.discountValue),
      shippingAddress: {
        fullName: order.shippingAddress.fullName,
        phone: order.shippingAddress.phone,
        addressLine1: order.shippingAddress.addressLine1,
        addressLine2: order.shippingAddress.addressLine2,
        city: order.shippingAddress.city,
        district: order.shippingAddress.district,
        ward: order.shippingAddress.ward,
        postalCode: order.shippingAddress.postalCode,
      },
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productSlug: item.productSlug,
        productName: item.productName,
        size: item.size,
        price: Number(item.price),
        quantity: item.quantity,
        subtotal: Number(item.price) * item.quantity,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}

import { OrderStatus } from '@generated/prisma';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ProductRepository } from '@/products/infrastructure/product.repository';

import { OrderDto } from '../../dtos/order.dto';
import { OrderRepository } from '../../infrastructure/order.repository';
import { OrderWithItems } from '../../types/order.types';
import { CancelOrderCommand } from './cancel-order.command';

@CommandHandler(CancelOrderCommand)
export class CancelOrderHandler implements ICommandHandler<CancelOrderCommand> {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async execute(command: CancelOrderCommand): Promise<OrderDto> {
    const { orderId, userId } = command;

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    // Verify order belongs to user
    if (order.userId !== userId) {
      throw new ForbiddenException('Order does not belong to user');
    }

    // Only allow cancellation if order is PENDING
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Cannot cancel order with status ${order.status}. Only PENDING orders can be cancelled.`
      );
    }

    // Restore stock
    for (const item of order.items) {
      if (item.productId) {
        if (item.size) {
          await this.productRepository.incrementSizeStock(
            item.productId,
            item.size,
            item.quantity
          );
        } else {
          await this.productRepository.incrementStock(
            item.productId,
            item.quantity
          );
        }
      }
    }

    // Update order status to CANCELLED
    const updatedOrder = await this.orderRepository.updateStatus(
      orderId,
      OrderStatus.CANCELLED
    );

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

import { OrderStatus } from '@generated/prisma';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { OrderDto, OrderListResponseDto } from '../../dtos/order.dto';
import { OrderRepository } from '../../infrastructure/order.repository';
import { OrderWithItems } from '../../types/order.types';
import { ListAllOrdersQuery } from './list-all-orders.query';

@QueryHandler(ListAllOrdersQuery)
export class ListAllOrdersHandler implements IQueryHandler<ListAllOrdersQuery> {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(query: ListAllOrdersQuery): Promise<OrderListResponseDto> {
    const { page, limit, status } = query;

    const where: { status?: OrderStatus } = {};
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      this.orderRepository.findAll(page, limit, status),
      this.orderRepository.countAll(status),
    ]);

    return {
      orders: orders.map((order) => this.mapToDto(order)),
      total,
    };
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

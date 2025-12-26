import {
  OrderStatus,
  PaymentStatus,
  ProductSize,
  ProductSlug,
} from '@generated/prisma';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CartRepository } from '@/cart/infrastructure/cart.repository';
import { ProductRepository } from '@/products/infrastructure/product.repository';

import { OrderDto } from '../../dtos/order.dto';
import { OrderRepository } from '../../infrastructure/order.repository';
import { OrderWithItems } from '../../types/order.types';
import { CreateOrderCommand } from './create-order.command';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async execute(command: CreateOrderCommand): Promise<OrderDto> {
    const { userId, shippingAddress } = command;

    // Get cart
    const cart = await this.cartRepository.findOrCreateCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate stock and calculate totals
    const orderItems: Array<{
      productId: string | null;
      productSlug: ProductSlug;
      productName: string;
      size: ProductSize | null;
      price: number;
      quantity: number;
    }> = [];
    let totalAmount = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.product;
      if (!product) {
        throw new NotFoundException(`Product ${cartItem.productId} not found`);
      }

      // Check stock
      let availableStock: number;
      if (product.hasSizes && cartItem.size) {
        const sizeStock = await this.productRepository.getStockBySize(
          product.id,
          cartItem.size
        );
        if (sizeStock === null) {
          throw new NotFoundException(
            `Size ${cartItem.size} not found for product ${product.id}`
          );
        }
        availableStock = sizeStock;
      } else {
        availableStock = product.stock;
      }

      if (cartItem.quantity > availableStock) {
        throw new ConflictException(
          `  stock for ${product.name}${cartItem.size ? ` (${cartItem.size})` : ''}. Available: ${availableStock}, Requested: ${cartItem.quantity}`
        );
      }

      const price = Number(product.priceCurrent);
      const subtotal = price * cartItem.quantity;
      totalAmount += subtotal;

      orderItems.push({
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        size: cartItem.size,
        price,
        quantity: cartItem.quantity,
      });
    }

    // Calculate shipping fee (free if total > 500k)
    const shippingFee = totalAmount >= 500000 ? 0 : 30000; // 30k shipping fee
    const discountValue = 0; // Can be extended later with vouchers

    const finalAmount = totalAmount + shippingFee - discountValue;

    // Generate order code
    const orderCode = await this.orderRepository.generateOrderCode();

    // Create order in transaction
    const order = await this.orderRepository.create({
      userId,
      code: orderCode,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      totalAmount: finalAmount,
      shippingFee,
      discountValue,
      shippingAddress,
      items: orderItems,
    });

    // Deduct stock (when order is created, stock is reserved)
    // Note: In production, you might want to reserve stock first and deduct when confirmed
    // For simplicity, we deduct immediately
    for (const item of orderItems) {
      if (item.productId) {
        if (item.size) {
          await this.productRepository.decrementSizeStock(
            item.productId,
            item.size,
            item.quantity
          );
        } else {
          await this.productRepository.decrementStock(
            item.productId,
            item.quantity
          );
        }
      }
    }

    // Clear cart
    await this.cartRepository.clearCart(cart.id);

    return this.mapToDto(order);
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

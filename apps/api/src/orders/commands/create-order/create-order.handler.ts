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
import { PrismaService } from '@/prisma/prisma.service';
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
    private readonly productRepository: ProductRepository,
    private readonly prisma: PrismaService
  ) {}

  async execute(command: CreateOrderCommand): Promise<OrderDto> {
    const {
      userId,
      shippingAddress,
      orderType,
      productId,
      productSlug,
      size,
      quantity,
    } = command;

    // Check for pending orders - prevent duplicate orders
    const pendingOrders =
      await this.orderRepository.findPendingOrdersByUserId(userId);
    if (pendingOrders.length > 0) {
      throw new ConflictException(
        `You have a pending order. Please complete or cancel it before creating a new one. Order ID: ${pendingOrders[0].id}`
      );
    }

    const orderItems: Array<{
      productId: string | null;
      productSlug: ProductSlug;
      productName: string;
      size: ProductSize | null;
      price: number;
      quantity: number;
    }> = [];
    let totalAmount = 0;

    if (orderType === 'FROM_CART') {
      // Get cart
      const cart = await this.cartRepository.findOrCreateCart(userId);
      if (!cart.items || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      // Validate stock and calculate totals from cart
      for (const cartItem of cart.items) {
        const product = cartItem.product;
        if (!product) {
          throw new NotFoundException(
            `Product ${cartItem.productId} not found`
          );
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
    } else if (orderType === 'DIRECT_PURCHASE') {
      // Direct purchase - validate required fields
      if (!productId || !productSlug || !quantity) {
        throw new BadRequestException(
          'productId, productSlug, and quantity are required for direct purchase'
        );
      }

      // Get product
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new NotFoundException(`Product ${productId} not found`);
      }

      // Validate product slug matches
      if (product.slug !== productSlug) {
        throw new BadRequestException('Product slug mismatch');
      }

      // Check stock
      let availableStock: number;
      if (product.hasSizes && size) {
        const sizeStock = await this.productRepository.getStockBySize(
          product.id,
          size
        );
        if (sizeStock === null) {
          throw new NotFoundException(
            `Size ${size} not found for product ${product.id}`
          );
        }
        availableStock = sizeStock;
      } else {
        if (product.hasSizes && !size) {
          throw new BadRequestException('Size is required for this product');
        }
        availableStock = product.stock;
      }

      if (quantity > availableStock) {
        throw new ConflictException(
          `Insufficient stock for ${product.name}${size ? ` (${size})` : ''}. Available: ${availableStock}, Requested: ${quantity}`
        );
      }

      const price = Number(product.priceCurrent);
      const subtotal = price * quantity;
      totalAmount = subtotal;

      orderItems.push({
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        size: size || null,
        price,
        quantity,
      });
    } else {
      throw new BadRequestException(`Invalid order type: ${orderType}`);
    }

    // Calculate shipping fee (free if total > 500k)
    const shippingFee = totalAmount >= 500000 ? 0 : 30000; // 30k shipping fee
    const discountValue = 0; // Can be extended later with vouchers

    const finalAmount = totalAmount + shippingFee - discountValue;

    // Use Prisma transaction for atomicity
    const order = await this.prisma.$transaction(async (tx) => {
      // Generate order code
      const orderCode = await this.orderRepository.generateOrderCode();

      // Create shipping address
      const shippingAddressRecord = await tx.shippingAddress.create({
        data: {
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2,
          city: shippingAddress.city,
          district: shippingAddress.district,
          ward: shippingAddress.ward,
          postalCode: shippingAddress.postalCode,
        },
      });

      // Create order
      const orderRecord = await tx.order.create({
        data: {
          userId,
          code: orderCode,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          totalAmount: finalAmount,
          shippingFee,
          discountValue,
          shippingAddressId: shippingAddressRecord.id,
          items: {
            create: orderItems.map((item) => ({
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

      // Deduct stock within transaction
      for (const item of orderItems) {
        if (item.productId) {
          if (item.size) {
            await tx.productSizeStock.updateMany({
              where: {
                productId: item.productId,
                size: item.size,
              },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          }
        }
      }

      return orderRecord;
    });

    // Clear cart only if FROM_CART
    if (orderType === 'FROM_CART') {
      const cart = await this.cartRepository.findOrCreateCart(userId);
      await this.cartRepository.clearCart(cart.id);
    }

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

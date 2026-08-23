import {
  OrderStatus,
  PaymentStatus,
  PaymentTransactionStatus,
  ProductSize,
  ProductSlug,
  UserRole,
} from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { CartRepo } from '@/cart/repo';
import { PrismaService } from '@/prisma';
import { availableStock, ProductRepo } from '@/products/repo';

import { CreateOrderDto, OrderDto, OrderListResponseDto } from '../dto';
import { OrderRepo, OrderRow } from '../repo';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly orderRepo: OrderRepo,
    private readonly cartRepo: CartRepo,
    private readonly productRepo: ProductRepo,
    private readonly prisma: PrismaService,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto): Promise<OrderDto> {
    const { shippingAddress, orderType, productId, productSlug, size, quantity } = dto;

    // Check for pending orders - prevent duplicate orders
    const pendingOrders = await this.orderRepo.findPendingOrdersByUserId(userId);
    if (pendingOrders.length > 0) {
      throw new ConflictException(
        `You have a pending order. Please complete or cancel it before creating a new one. Order ID: ${pendingOrders[0].id}`,
      );
    }

    let cartId: string | null = null;
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
      const cart = await this.cartRepo.findOrCreateCart(userId);
      if (!cart.items || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }
      cartId = cart.id;

      // Validate stock and calculate totals from cart
      for (const cartItem of cart.items) {
        const product = cartItem.product;
        if (!product) {
          throw new NotFoundException(`Product ${cartItem.productId} not found`);
        }

        const available = availableStock(product, cartItem.size);
        if (available === null) {
          throw new NotFoundException(`Size ${cartItem.size} not found for product ${product.id}`);
        }

        if (cartItem.quantity > available) {
          throw new ConflictException(
            `  stock for ${product.name}${cartItem.size ? ` (${cartItem.size})` : ''}. Available: ${available}, Requested: ${cartItem.quantity}`,
          );
        }

        const price = Number(product.priceCurrent);
        totalAmount += price * cartItem.quantity;

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
      if (!productId || !productSlug || !quantity) {
        throw new BadRequestException(
          'productId, productSlug, and quantity are required for direct purchase',
        );
      }

      const product = await this.productRepo.findById(productId);
      if (!product) {
        throw new NotFoundException(`Product ${productId} not found`);
      }

      if (product.slug !== productSlug) {
        throw new BadRequestException('Product slug mismatch');
      }

      if (product.hasSizes && !size) {
        throw new BadRequestException('Size is required for this product');
      }

      const available = availableStock(product, size);
      if (available === null) {
        throw new NotFoundException(`Size ${size} not found for product ${product.id}`);
      }

      if (quantity > available) {
        throw new ConflictException(
          `Insufficient stock for ${product.name}${size ? ` (${size})` : ''}. Available: ${available}, Requested: ${quantity}`,
        );
      }

      const price = Number(product.priceCurrent);
      totalAmount = price * quantity;

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

    // Calculate shipping fee (free if total >= 500k)
    const shippingFee = totalAmount >= 500000 ? 0 : 30000;
    const discountValue = 0; // Can be extended later with vouchers

    const finalAmount = totalAmount + shippingFee - discountValue;

    const order = await this.prisma.$transaction(async (tx) => {
      const orderCode = await this.orderRepo.generateOrderCode(tx);

      const orderRecord = await this.orderRepo.create(
        {
          userId,
          code: orderCode,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          totalAmount: finalAmount,
          shippingFee,
          discountValue,
          shippingAddress,
          items: orderItems,
        },
        tx,
      );

      // Deduct stock within transaction; conditional update guards against oversell races
      await this.productRepo.reserve(
        tx,
        orderItems.flatMap((item) =>
          item.productId
            ? [{ productId: item.productId, size: item.size, quantity: item.quantity }]
            : [],
        ),
      );

      if (cartId) {
        await this.cartRepo.clearCart(cartId, tx);
      }

      return orderRecord;
    });

    return this.toDto(order);
  }

  async getOrderById(orderId: string, userId: string, requesterRole: string): Promise<OrderDto> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    // Only owner or admin can view order
    if (order.userId !== userId && requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    return this.toDto(order);
  }

  async listOrders(userId: string, page: number, limit: number): Promise<OrderListResponseDto> {
    const { orders, total } = await this.orderRepo.findByUserId(userId, page, limit);

    return { orders: orders.map((order) => this.toDto(order)), total };
  }

  async listAllOrders(
    page: number,
    limit: number,
    status?: OrderStatus,
  ): Promise<OrderListResponseDto> {
    const [orders, total] = await Promise.all([
      this.orderRepo.findAll(page, limit, status),
      this.orderRepo.countAll(status),
    ]);

    return { orders: orders.map((order) => this.toDto(order)), total };
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    requesterRole: string,
  ): Promise<OrderDto> {
    // Only admin can update order status
    if (requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admin can update order status');
    }

    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    const updatedOrder = await this.orderRepo.updateStatus(orderId, status);

    // If order is confirmed, update payment status to PAID
    if (status === 'CONFIRMED' && updatedOrder.paymentStatus === 'PENDING') {
      await this.orderRepo.updatePaymentStatus(orderId, 'PAID');
      const finalOrder = await this.orderRepo.findById(orderId);
      return this.toDto(finalOrder!);
    }

    return this.toDto(updatedOrder);
  }

  async cancelOrder(orderId: string, userId: string): Promise<OrderDto> {
    const order = await this.orderRepo.findById(orderId);
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
        `Cannot cancel order with status ${order.status}. Only PENDING orders can be cancelled.`,
      );
    }

    // Claim the cancellation - concurrent actor may have won
    const claimed = await this.orderRepo.cancelPending(orderId);
    if (claimed === 0) {
      throw new BadRequestException(
        `Cannot cancel order with status ${order.status}. Only PENDING orders can be cancelled.`,
      );
    }

    // Restore stock
    await this.productRepo.release(
      undefined,
      order.items.flatMap((item) =>
        item.productId
          ? [{ productId: item.productId, size: item.size, quantity: item.quantity }]
          : [],
      ),
    );

    const cancelled = await this.orderRepo.findById(orderId);
    return this.toDto(cancelled!);
  }

  async expireOrder(orderId: string): Promise<void> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    // Check if order can be expired (idempotent check)
    if (order.status !== OrderStatus.PENDING) {
      this.logger.log(`Order ${orderId} cannot be expired - status is ${order.status}`);
      return;
    }

    if (order.paymentStatus !== PaymentStatus.PENDING) {
      this.logger.log(
        `Order ${orderId} cannot be expired - payment status is ${order.paymentStatus}`,
      );
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      // Claim the expiry - concurrent actor may have won
      const claimed = await tx.order.updateMany({
        where: { id: orderId, status: OrderStatus.PENDING, paymentStatus: PaymentStatus.PENDING },
        data: { status: OrderStatus.CANCELLED, paymentStatus: PaymentStatus.FAILED },
      });
      if (claimed.count === 0) {
        this.logger.log(`Order ${orderId} expired concurrently - skipping`);
        return;
      }

      // Restore stock
      await this.productRepo.release(
        tx,
        order.items.flatMap((item) =>
          item.productId
            ? [{ productId: item.productId, size: item.size, quantity: item.quantity }]
            : [],
        ),
      );

      // Update payment transaction if exists
      const paymentTransaction = await tx.paymentTransaction.findUnique({
        where: { orderId },
      });
      if (paymentTransaction) {
        await tx.paymentTransaction.update({
          where: { id: paymentTransaction.id },
          data: { status: PaymentTransactionStatus.EXPIRED },
        });
      }
    });

    this.logger.log(`Order ${orderId} expired and stock restored after 15 minutes`);
  }

  private toDto(order: OrderRow): OrderDto {
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

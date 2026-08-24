import {
  OrderStatus,
  PaymentStatus,
  PaymentTransactionStatus,
  Prisma,
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
import { availableStock, ProductRepo, type StockItem } from '@/products/repo';

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

    return this.toDto(updatedOrder);
  }

  // Settles an order exactly once: PENDING-only conditional claim, losers no-op.
  // Status, paymentStatus, transaction row and stock release happen in one transaction.
  async settle(
    orderId: string,
    opts: { paid: boolean; payosData?: unknown },
  ): Promise<OrderDto | null> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }
    const items = this.stockItems(order.items);

    return this.prisma.$transaction(async (tx) => {
      const claimed = await this.orderRepo.claimSettled(orderId, opts.paid, tx);
      if (claimed === 0) {
        return null;
      }

      await this.markTransaction(
        tx,
        orderId,
        opts.paid ? PaymentTransactionStatus.PAID : PaymentTransactionStatus.FAILED,
        opts.payosData,
      );

      if (!opts.paid) {
        await this.productRepo.release(tx, items);
      }

      const settled = await this.orderRepo.findById(orderId, tx);
      return this.toDto(settled!);
    });
  }

  async markPaid(orderId: string): Promise<OrderDto> {
    const settled = await this.settle(orderId, { paid: true });
    if (!settled) {
      throw new BadRequestException('Only PENDING orders can be marked paid');
    }
    return settled;
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
    const claimed = await this.claimAndRelease(orderId, this.stockItems(order.items), (tx) =>
      this.orderRepo.cancelPending(orderId, tx),
    );
    if (!claimed) {
      throw new BadRequestException(
        `Cannot cancel order with status ${order.status}. Only PENDING orders can be cancelled.`,
      );
    }

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

    const claimed = await this.claimAndRelease(
      orderId,
      this.stockItems(order.items),
      (tx) => this.orderRepo.expirePending(orderId, tx),
      (tx) => this.markTransaction(tx, orderId, PaymentTransactionStatus.EXPIRED),
    );

    if (!claimed) {
      this.logger.log(`Order ${orderId} expired concurrently - skipping`);
      return;
    }

    this.logger.log(`Order ${orderId} expired and stock restored after 15 minutes`);
  }

  // One claim-and-release path shared by cancelOrder and expireOrder
  private async claimAndRelease(
    orderId: string,
    items: StockItem[],
    claim: (tx: Prisma.TransactionClient) => Promise<number>,
    afterClaim?: (tx: Prisma.TransactionClient) => Promise<void>,
  ): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const claimed = await claim(tx);
      if (claimed === 0) {
        return false;
      }

      await this.productRepo.release(tx, items);
      await afterClaim?.(tx);
      return true;
    });
  }

  private async markTransaction(
    tx: Prisma.TransactionClient,
    orderId: string,
    status: PaymentTransactionStatus,
    payosData?: unknown,
  ): Promise<void> {
    const paymentTransaction = await tx.paymentTransaction.findUnique({
      where: { orderId },
    });
    if (paymentTransaction) {
      await tx.paymentTransaction.update({
        where: { id: paymentTransaction.id },
        data: { status, ...(payosData ? { payosData: payosData as object } : {}) },
      });
    }
  }

  private stockItems(items: OrderRow['items']): StockItem[] {
    return items.flatMap((item) =>
      item.productId
        ? [{ productId: item.productId, size: item.size, quantity: item.quantity }]
        : [],
    );
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

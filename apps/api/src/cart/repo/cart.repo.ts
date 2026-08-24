import { Prisma, ProductSize } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma';
import {
  CART_WITH_ITEMS_INCLUDE,
  CART_ITEM_INCLUDE,
  type CartWithItems,
  type CartItemWithProduct,
} from './cart.selects';

@Injectable()
export class CartRepo {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateCart(userId: string, tx?: Prisma.TransactionClient): Promise<CartWithItems> {
    const client = tx ?? this.prisma;
    let cart = await client.cart.findUnique({
      where: { userId },
      include: CART_WITH_ITEMS_INCLUDE,
    });

    if (!cart) {
      cart = await client.cart.create({
        data: {
          userId,
        },
        include: CART_WITH_ITEMS_INCLUDE,
      });
    }

    return cart;
  }

  async findCartItem(cartId: string, productId: string, size: ProductSize | null) {
    return this.prisma.cartItem.findFirst({
      where: {
        cartId,
        productId,
        size,
      },
    });
  }

  async addItem(
    cartId: string,
    productId: string,
    size: ProductSize | null,
    quantity: number,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    // Find existing item first
    const existingItem = await client.cartItem.findFirst({
      where: {
        cartId,
        productId,
        size,
      },
    });

    if (existingItem) {
      return client.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: {
            increment: quantity,
          },
        },
      });
    }

    return client.cartItem.create({
      data: {
        cartId,
        productId,
        size,
        quantity,
      },
    });
  }

  async updateItemQuantity(cartItemId: string, quantity: number, tx?: Prisma.TransactionClient) {
    return (tx ?? this.prisma).cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
  }

  async removeItem(cartItemId: string, tx?: Prisma.TransactionClient) {
    return (tx ?? this.prisma).cartItem.delete({
      where: { id: cartItemId },
    });
  }

  async clearCart(cartId: string, tx?: Prisma.TransactionClient) {
    return (tx ?? this.prisma).cartItem.deleteMany({
      where: { cartId },
    });
  }

  async getCartItemById(cartItemId: string): Promise<CartItemWithProduct | null> {
    return this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: CART_ITEM_INCLUDE,
    });
  }
}

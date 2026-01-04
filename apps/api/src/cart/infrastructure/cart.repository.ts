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

import { ProductSize } from '@generated/prisma';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CartWithItems } from '../types/cart.types';

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateCart(userId: string): Promise<CartWithItems> {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                sizeStocks: true,
              },
            },
          },
          orderBy: { id: 'desc' },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  sizeStocks: true,
                },
              },
            },
            orderBy: { id: 'desc' },
          },
        },
      });
    }

    return cart;
  }

  async findCartItem(
    cartId: string,
    productId: string,
    size: ProductSize | null
  ) {
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
    quantity: number
  ) {
    // Find existing item first
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId,
        productId,
        size,
      },
    });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: {
            increment: quantity,
          },
        },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId,
        productId,
        size,
        quantity,
      },
    });
  }

  async updateItemQuantity(cartItemId: string, quantity: number) {
    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
  }

  async removeItem(cartItemId: string) {
    return this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }

  async clearCart(cartId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }

  async getCartItemById(
    cartItemId: string
  ): Promise<CartWithItems['items'][0] | null> {
    return this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        product: {
          include: {
            sizeStocks: true,
          },
        },
      },
    });
  }
}

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

import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CartDto } from '../../dtos/cart.dto';
import { CartRepository } from '../../infrastructure/cart.repository';
import { CartWithItems } from '../../types/cart.types';
import { getProductImageUrl } from '../../utils/product-image.util';
import { RemoveFromCartCommand } from './remove-from-cart.command';

@CommandHandler(RemoveFromCartCommand)
export class RemoveFromCartHandler implements ICommandHandler<RemoveFromCartCommand> {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(command: RemoveFromCartCommand): Promise<CartDto> {
    const { userId, cartItemId } = command;

    // Get cart item
    const cartItem = await this.cartRepository.getCartItemById(cartItemId);
    if (!cartItem) {
      throw new NotFoundException(`Cart item with id ${cartItemId} not found`);
    }

    // Verify cart belongs to user
    const cart = await this.cartRepository.findOrCreateCart(userId);
    if (cartItem.cartId !== cart.id) {
      throw new ForbiddenException('Cart item does not belong to user');
    }

    // Remove item
    await this.cartRepository.removeItem(cartItemId);

    // Return updated cart
    const updatedCart = await this.cartRepository.findOrCreateCart(userId);
    return this.mapToDto(updatedCart);
  }

  private mapToDto(cart: CartWithItems): CartDto {
    const items = cart.items.map((item) => {
      const product = item.product;
      const productPrice = Number(product.priceCurrent);
      const subtotal = productPrice * item.quantity;

      let stockAvailable: number;
      if (product.hasSizes && item.size) {
        const sizeStock = product.sizeStocks?.find(
          (ss) => ss.size === item.size
        );
        stockAvailable = sizeStock?.stock || 0;
      } else {
        stockAvailable = product.stock;
      }

      return {
        id: item.id,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productPrice,
        productImage: getProductImageUrl(product.slug),
        size: item.size,
        quantity: item.quantity,
        subtotal,
        stockAvailable,
      };
    });

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      id: cart.id,
      items,
      totalItems,
      totalAmount,
      updatedAt: cart.updatedAt,
    };
  }
}

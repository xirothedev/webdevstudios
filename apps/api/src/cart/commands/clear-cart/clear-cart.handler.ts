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

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CartDto, CartItemDto } from '../../dtos/cart.dto';
import { CartRepository } from '../../infrastructure/cart.repository';
import { CartWithItems } from '../../types/cart.types';
import { ClearCartCommand } from './clear-cart.command';

@CommandHandler(ClearCartCommand)
export class ClearCartHandler implements ICommandHandler<ClearCartCommand> {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(command: ClearCartCommand): Promise<CartDto> {
    const { userId } = command;

    // Get or create cart
    const cart = await this.cartRepository.findOrCreateCart(userId);

    // Clear cart
    await this.cartRepository.clearCart(cart.id);

    // Return empty cart
    const updatedCart = await this.cartRepository.findOrCreateCart(userId);
    return this.mapToDto(updatedCart);
  }

  private mapToDto(cart: CartWithItems): CartDto {
    const items: CartItemDto[] = [];

    return {
      id: cart.id,
      items,
      totalItems: 0,
      totalAmount: 0,
      updatedAt: cart.updatedAt,
    };
  }
}

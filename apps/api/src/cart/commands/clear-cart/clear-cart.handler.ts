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

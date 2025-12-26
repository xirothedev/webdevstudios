import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ProductRepository } from '../../../products/infrastructure/product.repository';
import { CartDto } from '../../dtos/cart.dto';
import { CartRepository } from '../../infrastructure/cart.repository';
import { CartWithItems } from '../../types/cart.types';
import { getProductImageUrl } from '../../utils/product-image.util';
import { UpdateCartItemCommand } from './update-cart-item.command';

@CommandHandler(UpdateCartItemCommand)
export class UpdateCartItemHandler implements ICommandHandler<UpdateCartItemCommand> {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async execute(command: UpdateCartItemCommand): Promise<CartDto> {
    const { userId, cartItemId, quantity } = command;

    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

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

    // Get product and check stock
    const product = cartItem.product;
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

    if (quantity > availableStock) {
      throw new ConflictException(
        `Insufficient stock. Available: ${availableStock}, Requested: ${quantity}`
      );
    }

    // Update quantity
    await this.cartRepository.updateItemQuantity(cartItemId, quantity);

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

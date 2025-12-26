import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ProductRepository } from '@/products/infrastructure/product.repository';

import { CartDto, CartItemDto } from '../../dtos/cart.dto';
import { CartRepository } from '../../infrastructure/cart.repository';
import { CartWithItems } from '../../types/cart.types';
import { getProductImageUrl } from '../../utils/product-image.util';
import { AddToCartCommand } from './add-to-cart.command';

@CommandHandler(AddToCartCommand)
export class AddToCartHandler implements ICommandHandler<AddToCartCommand> {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async execute(command: AddToCartCommand): Promise<CartDto> {
    const { userId, productId, size, quantity } = command;

    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    // Get product and validate
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    // Validate size if product has sizes
    if (product.hasSizes && !size) {
      throw new BadRequestException('Size is required for products with sizes');
    }

    if (!product.hasSizes && size) {
      throw new BadRequestException('Size is not supported for this product');
    }

    // Check stock
    let availableStock: number;
    if (product.hasSizes && size) {
      const sizeStock = await this.productRepository.getStockBySize(
        productId,
        size
      );
      if (sizeStock === null) {
        throw new NotFoundException(
          `Size ${size} not found for product ${productId}`
        );
      }
      availableStock = sizeStock;
    } else {
      availableStock = product.stock;
    }

    // Get or create cart
    const cart = await this.cartRepository.findOrCreateCart(userId);

    // Check existing quantity in cart
    const existingItem = await this.cartRepository.findCartItem(
      cart.id,
      productId,
      size
    );
    const currentQuantity = existingItem?.quantity || 0;
    const newTotalQuantity = currentQuantity + quantity;

    if (newTotalQuantity > availableStock) {
      throw new ConflictException(
        `Insufficient stock. Available: ${availableStock}, Requested: ${newTotalQuantity}`
      );
    }

    // Add to cart
    await this.cartRepository.addItem(cart.id, productId, size, quantity);

    // Return updated cart
    const updatedCart = await this.cartRepository.findOrCreateCart(userId);
    return this.mapToDto(updatedCart);
  }

  private mapToDto(cart: CartWithItems): CartDto {
    const items: CartItemDto[] = cart.items.map((item) => {
      const product = item.product;
      const productPrice = Number(product.priceCurrent);
      const subtotal = productPrice * item.quantity;

      // Get stock available
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

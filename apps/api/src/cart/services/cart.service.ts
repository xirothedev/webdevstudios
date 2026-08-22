import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ProductSize } from '@prisma/client';

import { ProductRepo } from '@/products/repo';

import { CartWithItems } from '../cart.types';
import { AddToCartDto, CartDto, UpdateCartItemDto } from '../dto';
import { CartRepo } from '../repo';
import { getProductImageUrl } from '../utils/product-image.util';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepo,
    private readonly productRepository: ProductRepo,
  ) {}

  async getCart(userId: string): Promise<CartDto> {
    const cart = await this.cartRepository.findOrCreateCart(userId);
    return this.mapToDto(cart);
  }

  async addToCart(userId: string, dto: AddToCartDto): Promise<CartDto> {
    const productId = dto.productId;
    const size: ProductSize | null = dto.size ?? null;
    const { quantity } = dto;

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
      const sizeStock = await this.productRepository.getStockBySize(productId, size);
      if (sizeStock === null) {
        throw new NotFoundException(`Size ${size} not found for product ${productId}`);
      }
      availableStock = sizeStock;
    } else {
      availableStock = product.stock;
    }

    // Get or create cart
    const cart = await this.cartRepository.findOrCreateCart(userId);

    // Check existing quantity in cart
    const existingItem = await this.cartRepository.findCartItem(cart.id, productId, size);
    const currentQuantity = existingItem?.quantity || 0;
    const newTotalQuantity = currentQuantity + quantity;

    if (newTotalQuantity > availableStock) {
      throw new ConflictException(
        `Insufficient stock. Available: ${availableStock}, Requested: ${newTotalQuantity}`,
      );
    }

    // Add to cart
    await this.cartRepository.addItem(cart.id, productId, size, quantity);

    // Return updated cart
    const updatedCart = await this.cartRepository.findOrCreateCart(userId);
    return this.mapToDto(updatedCart);
  }

  async updateCartItem(
    userId: string,
    cartItemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartDto> {
    const { quantity } = dto;

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
      const sizeStock = await this.productRepository.getStockBySize(product.id, cartItem.size);
      if (sizeStock === null) {
        throw new NotFoundException(`Size ${cartItem.size} not found for product ${product.id}`);
      }
      availableStock = sizeStock;
    } else {
      availableStock = product.stock;
    }

    if (quantity > availableStock) {
      throw new ConflictException(
        `Insufficient stock. Available: ${availableStock}, Requested: ${quantity}`,
      );
    }

    // Update quantity
    await this.cartRepository.updateItemQuantity(cartItemId, quantity);

    // Return updated cart
    const updatedCart = await this.cartRepository.findOrCreateCart(userId);
    return this.mapToDto(updatedCart);
  }

  async removeFromCart(userId: string, cartItemId: string): Promise<CartDto> {
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

  async clearCart(userId: string): Promise<CartDto> {
    // Get or create cart
    const cart = await this.cartRepository.findOrCreateCart(userId);

    // Clear cart
    await this.cartRepository.clearCart(cart.id);

    // Return empty cart
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
        const sizeStock = product.sizeStocks?.find((ss) => ss.size === item.size);
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

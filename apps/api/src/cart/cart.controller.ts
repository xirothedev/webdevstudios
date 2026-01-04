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

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AddToCartCommand } from './commands/add-to-cart/add-to-cart.command';
import { ClearCartCommand } from './commands/clear-cart/clear-cart.command';
import { RemoveFromCartCommand } from './commands/remove-from-cart/remove-from-cart.command';
import { UpdateCartItemCommand } from './commands/update-cart-item/update-cart-item.command';
import { AddToCartDto, CartDto, UpdateCartItemDto } from './dtos/cart.dto';
import { GetCartQuery } from './queries/get-cart/get-cart.query';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user cart',
    description: 'Get the authenticated user cart with all items',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully',
    type: CartDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCart(@CurrentUser() user: { id: string }): Promise<CartDto> {
    return this.queryBus.execute(new GetCartQuery(user.id));
  }

  @Post('items')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add item to cart',
    description:
      'Add a product to cart. Validates stock before adding. For products with sizes, size is required.',
  })
  @ApiResponse({
    status: 201,
    description: 'Item added to cart successfully',
    type: CartDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Conflict - Insufficient stock' })
  async addToCart(
    @CurrentUser() user: { id: string },
    @Body() dto: AddToCartDto
  ): Promise<CartDto> {
    return this.commandBus.execute(
      new AddToCartCommand(
        user.id,
        dto.productId,
        dto.size || null,
        dto.quantity
      )
    );
  }

  @Patch('items/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update cart item quantity',
    description: 'Update the quantity of a cart item. Validates stock.',
  })
  @ApiParam({
    name: 'id',
    description: 'Cart item ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart item updated successfully',
    type: CartDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Insufficient stock' })
  async updateCartItem(
    @CurrentUser() user: { id: string },
    @Param('id') cartItemId: string,
    @Body() dto: UpdateCartItemDto
  ): Promise<CartDto> {
    return this.commandBus.execute(
      new UpdateCartItemCommand(user.id, cartItemId, dto.quantity)
    );
  }

  @Delete('items/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove item from cart',
    description: 'Remove an item from the cart',
  })
  @ApiParam({
    name: 'id',
    description: 'Cart item ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Item removed from cart successfully',
    type: CartDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async removeFromCart(
    @CurrentUser() user: { id: string },
    @Param('id') cartItemId: string
  ): Promise<CartDto> {
    return this.commandBus.execute(
      new RemoveFromCartCommand(user.id, cartItemId)
    );
  }

  @Delete()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Clear cart',
    description: 'Remove all items from the cart',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart cleared successfully',
    type: CartDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async clearCart(@CurrentUser() user: { id: string }): Promise<CartDto> {
    return this.commandBus.execute(new ClearCartCommand(user.id));
  }
}

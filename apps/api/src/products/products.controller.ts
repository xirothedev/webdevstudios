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

import { ProductSize, ProductSlug, UserRole } from '@generated/prisma';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateProductCommand } from './commands/update-product/update-product.command';
import { UpdateProductSizesCommand } from './commands/update-product-sizes/update-product-sizes.command';
import { UpdateProductStockCommand } from './commands/update-product-stock/update-product-stock.command';
import {
  ProductDto,
  ProductListResponseDto,
  StockInfoDto,
} from './dtos/product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { UpdateProductSizesDto } from './dtos/update-product-sizes.dto';
import { UpdateProductStockDto } from './dtos/update-product-stock.dto';
import { GetProductBySlugQuery } from './queries/get-product-by-slug/get-product-by-slug.query';
import { GetProductStockQuery } from './queries/get-product-stock/get-product-stock.query';
import { ListProductsQuery } from './queries/list-products/list-products.query';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'List all products',
    description: 'Get a list of all published products with stock information',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: ProductListResponseDto,
  })
  async listProducts(): Promise<ProductListResponseDto> {
    return this.queryBus.execute(new ListProductsQuery());
  }

  @Get(':slug')
  @Public()
  @ApiOperation({
    summary: 'Get product by slug',
    description: 'Get product details by slug with stock information',
  })
  @ApiParam({
    name: 'slug',
    description: 'Product slug',
    enum: ['AO_THUN', 'PAD_CHUOT', 'DAY_DEO', 'MOC_KHOA'],
    example: 'AO_THUN',
  })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductBySlug(@Param('slug') slug: string): Promise<ProductDto> {
    return this.queryBus.execute(
      new GetProductBySlugQuery(slug as ProductSlug)
    );
  }

  @Get(':slug/stock')
  @Public()
  @ApiOperation({
    summary: 'Get product stock information',
    description:
      'Get stock information for a product. For products with sizes, optionally filter by size.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Product slug',
    enum: ['AO_THUN', 'PAD_CHUOT', 'DAY_DEO', 'MOC_KHOA'],
    example: 'AO_THUN',
  })
  @ApiQuery({
    name: 'size',
    description: 'Product size (only for products with sizes)',
    enum: ['S', 'M', 'L', 'XL'],
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Stock information retrieved successfully',
    type: StockInfoDto,
  })
  @ApiResponse({ status: 404, description: 'Product or size not found' })
  async getProductStock(
    @Param('slug') slug: string,
    @Query('size') size?: string
  ): Promise<StockInfoDto> {
    return this.queryBus.execute(
      new GetProductStockQuery(
        slug as ProductSlug,
        size ? (size as ProductSize) : undefined
      )
    );
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update product (Admin only)',
    description: 'Update product information. Admin only endpoint.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto
  ): Promise<ProductDto> {
    return this.commandBus.execute(
      new UpdateProductCommand(
        id,
        dto.name,
        dto.description,
        dto.priceCurrent,
        dto.priceOriginal,
        dto.badge,
        dto.isPublished
      )
    );
  }

  @Patch(':id/stock')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update product stock (Admin only)',
    description:
      'Update product stock. For products with sizes, specify size to update size-specific stock.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock updated successfully',
    type: ProductDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateProductStock(
    @Param('id') id: string,
    @Body() dto: UpdateProductStockDto
  ): Promise<ProductDto> {
    return this.commandBus.execute(
      new UpdateProductStockCommand(id, dto.stock, dto.size)
    );
  }

  @Patch(':id/sizes')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update product size stocks (Admin only)',
    description:
      'Update multiple size stocks at once. Total stock will be automatically recalculated. Use stock = 0 to effectively remove a size.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Size stocks updated successfully',
    type: ProductDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateProductSizes(
    @Param('id') id: string,
    @Body() dto: UpdateProductSizesDto
  ): Promise<ProductDto> {
    return this.commandBus.execute(
      new UpdateProductSizesCommand(
        id,
        dto.sizeStocks.map((ss) => ({ size: ss.size, stock: ss.stock }))
      )
    );
  }
}

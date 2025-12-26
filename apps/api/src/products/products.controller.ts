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
import { UpdateProductStockCommand } from './commands/update-product-stock/update-product-stock.command';
import {
  ProductDto,
  ProductListResponseDto,
  StockInfoDto,
} from './dtos/product.dto';
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
}

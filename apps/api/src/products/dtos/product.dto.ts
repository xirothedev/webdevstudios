import { ProductSize, ProductSlug } from '@generated/prisma';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductSizeStockDto {
  @ApiProperty({
    description: 'Product size',
    enum: ProductSize,
    example: ProductSize.M,
  })
  size: ProductSize;

  @ApiProperty({
    description: 'Stock quantity for this size',
    example: 10,
  })
  stock: number;
}

export class ProductDto {
  @ApiProperty({
    description: 'Product ID',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Product slug',
    enum: ProductSlug,
    example: ProductSlug.AO_THUN,
  })
  slug: ProductSlug;

  @ApiProperty({
    description: 'Product name',
    example: 'Áo thun WebDev Studios',
  })
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Áo thun chất lượng cao...',
  })
  description: string;

  @ApiProperty({
    description: 'Current price',
    example: 299000,
    type: Number,
  })
  priceCurrent: number;

  @ApiPropertyOptional({
    description: 'Original price (if discounted)',
    example: 399000,
    type: Number,
    nullable: true,
  })
  priceOriginal: number | null;

  @ApiPropertyOptional({
    description: 'Discount amount',
    example: 100000,
    type: Number,
    nullable: true,
  })
  priceDiscount: number | null;

  @ApiProperty({
    description: 'Total stock quantity',
    example: 15,
  })
  stock: number;

  @ApiProperty({
    description: 'Whether product has sizes',
    example: true,
  })
  hasSizes: boolean;

  @ApiPropertyOptional({
    description: 'Product badge',
    example: 'Official Merch',
    nullable: true,
  })
  badge: string | null;

  @ApiProperty({
    description: 'Average rating',
    example: 4.8,
    type: Number,
  })
  ratingValue: number;

  @ApiProperty({
    description: 'Number of reviews',
    example: 127,
  })
  ratingCount: number;

  @ApiPropertyOptional({
    description: 'Stock by size (only for products with sizes)',
    type: [ProductSizeStockDto],
    nullable: true,
  })
  sizeStocks?: ProductSizeStockDto[] | null;

  @ApiProperty({
    description: 'Stock status',
    enum: ['in_stock', 'low_stock', 'out_of_stock'],
    example: 'in_stock',
  })
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';

  @ApiProperty({
    description: 'Whether product is published',
    example: true,
  })
  isPublished: boolean;

  @ApiProperty({
    description: 'Product creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class ProductListResponseDto {
  @ApiProperty({
    description: 'List of products',
    type: [ProductDto],
  })
  products: ProductDto[];

  @ApiProperty({
    description: 'Total number of products',
    example: 4,
  })
  total: number;
}

export class StockInfoDto {
  @ApiProperty({
    description: 'Total stock',
    example: 15,
  })
  stock: number;

  @ApiProperty({
    description: 'Stock status',
    enum: ['in_stock', 'low_stock', 'out_of_stock'],
    example: 'in_stock',
  })
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';

  @ApiPropertyOptional({
    description: 'Stock by size (only for products with sizes)',
    type: [ProductSizeStockDto],
    nullable: true,
  })
  sizeStocks?: ProductSizeStockDto[] | null;
}

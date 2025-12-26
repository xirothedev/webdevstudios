import { ProductSize } from '@generated/prisma';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CartItemDto {
  @ApiProperty({
    description: 'Cart item ID',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Product ID',
    example: 'clx1234567890',
  })
  productId: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Áo thun WebDev Studios',
  })
  productName: string;

  @ApiProperty({
    description: 'Product slug',
    example: 'AO_THUN',
  })
  productSlug: string;

  @ApiProperty({
    description: 'Product price',
    example: 299000,
    type: Number,
  })
  productPrice: number;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://example.com/image.webp',
  })
  productImage: string;

  @ApiPropertyOptional({
    description: 'Product size (for products with sizes)',
    enum: ProductSize,
    example: ProductSize.M,
    nullable: true,
  })
  size: ProductSize | null;

  @ApiProperty({
    description: 'Quantity',
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: 'Subtotal (price * quantity)',
    example: 598000,
    type: Number,
  })
  subtotal: number;

  @ApiProperty({
    description: 'Stock available',
    example: 10,
  })
  stockAvailable: number;
}

export class CartDto {
  @ApiProperty({
    description: 'Cart ID',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Cart items',
    type: [CartItemDto],
  })
  items: CartItemDto[];

  @ApiProperty({
    description: 'Total items count',
    example: 3,
  })
  totalItems: number;

  @ApiProperty({
    description: 'Total amount',
    example: 897000,
    type: Number,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class AddToCartDto {
  @ApiProperty({
    description: 'Product ID',
    example: 'clx1234567890',
  })
  productId: string;

  @ApiPropertyOptional({
    description: 'Product size (required for products with sizes)',
    enum: ProductSize,
    example: ProductSize.M,
  })
  size?: ProductSize;

  @ApiProperty({
    description: 'Quantity',
    example: 1,
    minimum: 1,
  })
  quantity: number;
}

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'Quantity',
    example: 2,
    minimum: 1,
  })
  quantity: number;
}

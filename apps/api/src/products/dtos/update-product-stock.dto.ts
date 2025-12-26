import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsPositive } from 'class-validator';
import { ProductSize } from 'generated/prisma/client';

export class UpdateProductStockDto {
  @ApiProperty({
    description: 'Stock quantity',
    example: 10,
    minimum: 0,
  })
  @IsInt()
  @IsPositive()
  stock: number;

  @ApiPropertyOptional({
    description: 'Product size (required for products with sizes)',
    enum: ProductSize,
    example: ProductSize.M,
  })
  @IsEnum(ProductSize)
  size?: ProductSize;
}

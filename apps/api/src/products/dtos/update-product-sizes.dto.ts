import { ProductSize } from '@generated/prisma';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ProductSizeStockInputDto {
  @ApiProperty({
    description: 'Product size',
    enum: ProductSize,
    example: ProductSize.M,
  })
  @IsString()
  size: ProductSize;

  @ApiProperty({
    description: 'Stock quantity for this size',
    example: 10,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  stock: number;
}

export class UpdateProductSizesDto {
  @ApiProperty({
    description: 'Array of size stocks to update',
    type: [ProductSizeStockInputDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  sizeStocks: ProductSizeStockInputDto[];
}

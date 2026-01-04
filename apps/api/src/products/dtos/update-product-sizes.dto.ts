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

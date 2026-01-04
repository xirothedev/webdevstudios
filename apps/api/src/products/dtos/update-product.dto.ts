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

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Product name',
    example: 'Áo Thun WebDev Studios',
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'Áo thun chất lượng cao...',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Current price',
    example: 250000,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  priceCurrent?: number;

  @ApiPropertyOptional({
    description: 'Original price (if discounted)',
    example: 300000,
    type: Number,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  priceOriginal?: number | null;

  @ApiPropertyOptional({
    description: 'Product badge',
    example: 'Limited Edition',
    maxLength: 50,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  badge?: string | null;

  @ApiPropertyOptional({
    description: 'Published status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

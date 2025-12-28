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

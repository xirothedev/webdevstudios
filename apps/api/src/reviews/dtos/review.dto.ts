import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ReviewDto {
  @ApiProperty({
    description: 'Review ID',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Rating (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  rating: number;

  @ApiPropertyOptional({
    description: 'Review comment',
    example: 'Sản phẩm rất tốt!',
    nullable: true,
  })
  comment: string | null;

  @ApiProperty({
    description: 'User ID',
    example: 'clx1234567890',
  })
  userId: string;

  @ApiProperty({
    description: 'User full name',
    example: 'Nguyễn Văn A',
  })
  userFullName: string;

  @ApiPropertyOptional({
    description: 'User avatar',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  userAvatar: string | null;

  @ApiProperty({
    description: 'Product ID',
    example: 'clx1234567890',
  })
  productId: string;

  @ApiProperty({
    description: 'Product slug',
    example: 'AO_THUN',
  })
  productSlug: string;

  @ApiProperty({
    description: 'Review creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class CreateReviewDto {
  @ApiProperty({
    description: 'Rating (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  rating: number;

  @ApiPropertyOptional({
    description: 'Review comment',
    example: 'Sản phẩm rất tốt!',
    nullable: true,
  })
  comment?: string | null;
}

export class UpdateReviewDto {
  @ApiPropertyOptional({
    description: 'Rating (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  rating?: number;

  @ApiPropertyOptional({
    description: 'Review comment',
    example: 'Sản phẩm rất tốt!',
    nullable: true,
  })
  comment?: string | null;
}

export class GetProductReviewsQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class ReviewListResponseDto {
  @ApiProperty({
    description: 'List of reviews',
    type: [ReviewDto],
  })
  reviews: ReviewDto[];

  @ApiProperty({
    description: 'Total number of reviews',
    example: 50,
  })
  total: number;

  @ApiProperty({
    description: 'Current page',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total pages',
    example: 5,
  })
  totalPages: number;
}

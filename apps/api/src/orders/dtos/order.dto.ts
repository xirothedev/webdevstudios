import {
  OrderStatus,
  PaymentStatus,
  ProductSize,
  ProductSlug,
} from '@generated/prisma';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @ApiProperty({
    description: 'Order item ID',
    example: 'clx1234567890',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'Product ID',
    example: 'clx1234567890',
    nullable: true,
  })
  productId: string | null;

  @ApiProperty({
    description: 'Product slug',
    example: 'AO_THUN',
  })
  productSlug: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Áo thun WebDev Studios',
  })
  productName: string;

  @ApiPropertyOptional({
    description: 'Product size',
    enum: ProductSize,
    example: ProductSize.M,
    nullable: true,
  })
  size: ProductSize | null;

  @ApiProperty({
    description: 'Price at time of purchase',
    example: 299000,
    type: Number,
  })
  price: number;

  @ApiProperty({
    description: 'Quantity',
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: 'Subtotal',
    example: 598000,
    type: Number,
  })
  subtotal: number;
}

export class ShippingAddressDto {
  @ApiProperty({
    description: 'Full name',
    example: 'Nguyễn Văn A',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+84123456789',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10,11}$/, {
    message: 'Phone number must be 10-11 digits',
  })
  phone: string;

  @ApiProperty({
    description: 'Address line 1',
    example: '123 Đường ABC',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  addressLine1: string;

  @ApiPropertyOptional({
    description: 'Address line 2',
    example: 'Phường XYZ',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressLine2?: string | null;

  @ApiProperty({
    description: 'City/Province',
    example: 'Hà Nội',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  city: string;

  @ApiProperty({
    description: 'District',
    example: 'Quận Hoàn Kiếm',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  district: string;

  @ApiProperty({
    description: 'Ward',
    example: 'Phường Hàng Bông',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  ward: string;

  @ApiProperty({
    description: 'Postal code',
    example: '100000',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{5,6}$/, {
    message: 'Postal code must be 5-6 digits',
  })
  postalCode: string;
}

export class OrderDto {
  @ApiProperty({
    description: 'Order ID',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Order code',
    example: '#ORD-1234',
  })
  code: string;

  @ApiProperty({
    description: 'Order status',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({
    description: 'Total amount',
    example: 897000,
    type: Number,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Shipping fee',
    example: 0,
    type: Number,
  })
  shippingFee: number;

  @ApiProperty({
    description: 'Discount value',
    example: 0,
    type: Number,
  })
  discountValue: number;

  @ApiProperty({
    description: 'Shipping address',
    type: ShippingAddressDto,
  })
  shippingAddress: ShippingAddressDto;

  @ApiProperty({
    description: 'Order items',
    type: [OrderItemDto],
  })
  items: OrderItemDto[];

  @ApiProperty({
    description: 'Order creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export enum OrderType {
  FROM_CART = 'FROM_CART',
  DIRECT_PURCHASE = 'DIRECT_PURCHASE',
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Shipping address',
    type: ShippingAddressDto,
  })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiProperty({
    description: 'Order type',
    enum: OrderType,
    default: OrderType.FROM_CART,
  })
  @IsEnum(OrderType)
  @IsNotEmpty()
  orderType: OrderType;

  @ApiPropertyOptional({
    description: 'Product ID (for direct purchase)',
    example: 'clx1234567890',
  })
  @ValidateIf((o) => o.orderType === OrderType.DIRECT_PURCHASE)
  @IsString()
  @IsNotEmpty()
  productId?: string;

  @ApiPropertyOptional({
    description: 'Product slug (for direct purchase)',
    example: 'AO_THUN',
  })
  @ValidateIf((o) => o.orderType === OrderType.DIRECT_PURCHASE)
  @IsEnum(ProductSlug)
  @IsNotEmpty()
  productSlug?: ProductSlug;

  @ApiPropertyOptional({
    description: 'Product size (for direct purchase)',
    enum: ProductSize,
    example: ProductSize.M,
  })
  @IsOptional()
  @IsEnum(ProductSize)
  size?: ProductSize;

  @ApiPropertyOptional({
    description: 'Quantity (for direct purchase)',
    example: 1,
    type: Number,
  })
  @ValidateIf((o) => o.orderType === OrderType.DIRECT_PURCHASE)
  @IsInt()
  @IsPositive()
  @Min(1)
  @Type(() => Number)
  quantity?: number;
}

export class OrderListResponseDto {
  @ApiProperty({
    description: 'List of orders',
    type: [OrderDto],
  })
  orders: OrderDto[];

  @ApiProperty({
    description: 'Total number of orders',
    example: 10,
  })
  total: number;
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Order status',
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
  })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;
}

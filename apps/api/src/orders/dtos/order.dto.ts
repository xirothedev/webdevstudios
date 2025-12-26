import { OrderStatus, PaymentStatus, ProductSize } from '@generated/prisma';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  fullName: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+84123456789',
  })
  phone: string;

  @ApiProperty({
    description: 'Address line 1',
    example: '123 Đường ABC',
  })
  addressLine1: string;

  @ApiPropertyOptional({
    description: 'Address line 2',
    example: 'Phường XYZ',
    nullable: true,
  })
  addressLine2?: string | null;

  @ApiProperty({
    description: 'City/Province',
    example: 'Hà Nội',
  })
  city: string;

  @ApiProperty({
    description: 'District',
    example: 'Quận Hoàn Kiếm',
  })
  district: string;

  @ApiProperty({
    description: 'Ward',
    example: 'Phường Hàng Bông',
  })
  ward: string;

  @ApiProperty({
    description: 'Postal code',
    example: '100000',
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

export class CreateOrderDto {
  @ApiProperty({
    description: 'Shipping address',
    type: ShippingAddressDto,
  })
  shippingAddress: ShippingAddressDto;
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
  status: OrderStatus;
}

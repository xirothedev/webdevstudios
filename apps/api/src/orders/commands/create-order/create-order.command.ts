import { ProductSize, ProductSlug } from '@generated/prisma';

import { ShippingAddressDto } from '../../dtos/order.dto';

export enum OrderType {
  FROM_CART = 'FROM_CART',
  DIRECT_PURCHASE = 'DIRECT_PURCHASE',
}

export class CreateOrderCommand {
  constructor(
    public readonly userId: string,
    public readonly shippingAddress: ShippingAddressDto,
    public readonly orderType: OrderType = OrderType.FROM_CART,
    // Direct purchase fields (optional)
    public readonly productId?: string,
    public readonly productSlug?: ProductSlug,
    public readonly size?: ProductSize,
    public readonly quantity?: number
  ) {}
}

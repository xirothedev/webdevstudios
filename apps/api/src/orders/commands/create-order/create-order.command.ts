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

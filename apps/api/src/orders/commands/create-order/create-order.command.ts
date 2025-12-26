import { ShippingAddressDto } from '../../dtos/order.dto';

export class CreateOrderCommand {
  constructor(
    public readonly userId: string,
    public readonly shippingAddress: ShippingAddressDto
  ) {}
}

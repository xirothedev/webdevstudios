import { UserRole } from '@generated/prisma';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ThrottleAPI } from '../common/decorators/throttle.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CancelOrderCommand } from './commands/cancel-order/cancel-order.command';
import { CreateOrderCommand } from './commands/create-order/create-order.command';
import { UpdateOrderStatusCommand } from './commands/update-order-status/update-order-status.command';
import {
  CreateOrderDto,
  OrderDto,
  OrderListResponseDto,
  UpdateOrderStatusDto,
} from './dtos/order.dto';
import { GetOrderByIdQuery } from './queries/get-order-by-id/get-order-by-id.query';
import { ListAllOrdersQuery } from './queries/list-all-orders/list-all-orders.query';
import { ListOrdersQuery } from './queries/list-orders/list-orders.query';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @ThrottleAPI()
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create order from cart',
    description:
      'Create an order from the current cart. Validates stock, calculates shipping fee, and deducts stock.',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Cart is empty' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Conflict - Insufficient stock' })
  async createOrder(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateOrderDto
  ): Promise<OrderDto> {
    return this.commandBus.execute(
      new CreateOrderCommand(
        user.id,
        dto.shippingAddress,
        dto.orderType,
        dto.productId,
        dto.productSlug,
        dto.size,
        dto.quantity
      )
    );
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List user orders',
    description: 'Get a paginated list of orders for the authenticated user',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    example: 1,
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    example: 10,
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: OrderListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listOrders(
    @CurrentUser() user: { id: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<OrderListResponseDto> {
    return this.queryBus.execute(
      new ListOrdersQuery(
        user.id,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 10
      )
    );
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get order by ID',
    description: 'Get order details by ID. Only order owner or admin can view.',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: OrderDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: UserRole }
  ): Promise<OrderDto> {
    return this.queryBus.execute(new GetOrderByIdQuery(id, user.id, user.role));
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all orders (Admin only)',
    description: 'Get a paginated list of all orders. Admin only endpoint.',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    example: 1,
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    example: 10,
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter by order status',
    enum: [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPING',
      'DELIVERED',
      'CANCELLED',
      'RETURNED',
    ],
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: OrderListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async listAllOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string
  ): Promise<OrderListResponseDto> {
    return this.queryBus.execute(
      new ListAllOrdersQuery(
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 10,
        status as any
      )
    );
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update order status (Admin only)',
    description: 'Update order status. Admin only endpoint.',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
    type: OrderDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: { role: UserRole }
  ): Promise<OrderDto> {
    return this.commandBus.execute(
      new UpdateOrderStatusCommand(id, dto.status, user.role)
    );
  }

  @Patch(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cancel order',
    description:
      'Cancel an order. Only PENDING orders can be cancelled. Stock will be restored.',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
    type: OrderDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Cannot cancel order',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async cancelOrder(
    @Param('id') id: string,
    @CurrentUser() user: { id: string }
  ): Promise<OrderDto> {
    return this.commandBus.execute(new CancelOrderCommand(id, user.id));
  }
}

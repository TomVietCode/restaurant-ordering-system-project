import {
  Controller, Get, Post, Patch, Param, Body, Query,
  HttpCode, HttpStatus, ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth,
} from '@nestjs/swagger';
import { Public, Roles } from '@common/decorators/index.js';
import { Role } from '@common/enums.js';
import { ApiResponseDto } from '@common/dtos/api-response.dto.js';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dtos/create-order.dto.js';
import { UpdateOrderStatusDto } from './dtos/update-order-status.dto.js';
import { QueryOrdersDto } from './dtos/query-orders.dto.js';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ── Public Customer Endpoints ──

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Place a new order (anonymous customer)' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or item out of stock' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async createOrder(@Body() dto: CreateOrderDto) {
    const order = await this.ordersService.createOrder(dto);
    return ApiResponseDto.success(order, 'Order placed successfully');
  }

  @Public()
  @Get('track/:trackingCode')
  @ApiOperation({ summary: 'Track order status by tracking code (anonymous customer)' })
  @ApiParam({ name: 'trackingCode', description: 'Order tracking UUID' })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async trackOrder(@Param('trackingCode') trackingCode: string) {
    const order = await this.ordersService.trackOrder(trackingCode);
    return ApiResponseDto.success(order);
  }

  // ── Protected Admin/Staff Endpoints ──

  @ApiBearerAuth('JWT-auth')
  @Roles(Role.STAFF, Role.OWNER)
  @Get()
  @ApiOperation({ summary: 'Get order board (paginated list)' })
  @ApiResponse({ status: 200, description: 'Paginated order list' })
  async findAll(@Query() query: QueryOrdersDto) {
    const result = await this.ordersService.findAll(query);
    return ApiResponseDto.success(result);
  }

  @ApiBearerAuth('JWT-auth')
  @Roles(Role.STAFF, Role.OWNER)
  @Get(':id')
  @ApiOperation({ summary: 'Get order detail by ID' })
  @ApiParam({ name: 'id', description: 'Order ID (integer)' })
  @ApiResponse({ status: 200, description: 'Order detail' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const order = await this.ordersService.findById(id);
    return ApiResponseDto.success(order);
  }

  @ApiBearerAuth('JWT-auth')
  @Roles(Role.STAFF, Role.OWNER)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (state machine)' })
  @ApiParam({ name: 'id', description: 'Order ID (integer)' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 400, description: 'Invalid state transition' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.ordersService.updateStatus(id, dto);
    return ApiResponseDto.success(order, 'Order status updated');
  }
}

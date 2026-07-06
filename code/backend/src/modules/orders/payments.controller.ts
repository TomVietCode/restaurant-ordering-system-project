import {
  Controller, Post, Param, Body, HttpCode, HttpStatus, ParseUUIDPipe, NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '@common/decorators/index.js';
import { Role } from '@common/enums.js';
import { ApiResponseDto } from '@common/dtos/api-response.dto.js';
import { OrdersService } from './orders.service.js';
import { CheckoutTableDto } from './dtos/checkout-table.dto.js';
import { CheckoutOrdersDto } from './dtos/checkout-orders.dto.js';

const ParseTableUUID = new ParseUUIDPipe({
  exceptionFactory: () => new NotFoundException('Table not found'),
});

@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@Roles(Role.STAFF, Role.OWNER)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout-table/:tableId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk checkout: mark all active orders for a table as PAID' })
  @ApiParam({ name: 'tableId', description: 'Table UUID' })
  @ApiResponse({ status: 200, description: 'All orders marked as PAID, table freed' })
  @ApiResponse({ status: 400, description: 'No active orders for this table' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async checkoutTable(
    @Param('tableId', ParseTableUUID) tableId: string,
    @Body() dto: CheckoutTableDto,
  ) {
    const orders = await this.ordersService.checkoutTable(tableId, dto);
    return ApiResponseDto.success(orders, `${orders.length} order(s) marked as PAID`);
  }

  @Post('checkout-orders')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Specific orders checkout: mark a list of specific active orders for a table as PAID' })
  @ApiResponse({ status: 200, description: 'Selected orders marked as PAID, table freed if all active orders terminal' })
  @ApiResponse({ status: 400, description: 'Invalid data (e.g. orders already PAID/CANCEL, or orders belong to a different table)' })
  @ApiResponse({ status: 404, description: 'Table or one of the orders not found' })
  async checkoutOrders(
    @Body() dto: CheckoutOrdersDto,
  ) {
    const orders = await this.ordersService.checkoutOrders(dto);
    return ApiResponseDto.success(orders, `${orders.length} order(s) marked as PAID`);
  }
}

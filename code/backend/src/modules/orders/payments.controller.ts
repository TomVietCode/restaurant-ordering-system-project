import { Controller, Post, Param, Body, HttpCode, HttpStatus, ParseUUIDPipe, NotFoundException, Get, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Public, Roles } from '@common/decorators/index.js';
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
@Controller('payments')
export class PaymentsController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout-table/:tableId')
  @Roles(Role.STAFF, Role.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk checkout: mark all active orders for a table as PAID' })
  @ApiParam({ name: 'tableId', description: 'Table UUID' })
  @ApiResponse({ status: 200, description: 'All orders marked as PAID, table freed' })
  @ApiResponse({ status: 400, description: 'No active orders for this table' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async checkoutTable(@Param('tableId', ParseTableUUID) tableId: string, @Body() dto: CheckoutTableDto) {
    const orders = await this.ordersService.checkoutTable(tableId, dto);
    return ApiResponseDto.success(orders, `${orders.length} order(s) marked as PAID`);
  }

  @Post('checkout-orders')
  @Roles(Role.STAFF, Role.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Specific orders checkout: mark a list of specific active orders for a table as PAID' })
  @ApiResponse({ status: 200, description: 'Selected orders marked as PAID, table freed if all active orders terminal' })
  @ApiResponse({ status: 400, description: 'Invalid data (e.g. orders already PAID/CANCEL, or orders belong to a different table)' })
  @ApiResponse({ status: 404, description: 'Table or one of the orders not found' })
  async checkoutOrders(@Body() dto: CheckoutOrdersDto) {
    const orders = await this.ordersService.checkoutOrders(dto);
    return ApiResponseDto.success(orders, `${orders.length} order(s) marked as PAID`);
  }

  @Get('bank-list')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get list of available banks for payment' })
  @ApiResponse({ status: 200, description: 'List of available banks returned successfully' })
  async getBankList() {
    return await this.ordersService.getBankList();
  }

  @Post(':id/pay')
  @Roles(Role.STAFF, Role.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Specific orders checkout: mark a list of specific active orders for a table as PAID' })
  @ApiResponse({ status: 200, description: 'Get payment-qr successfully' })
  @ApiResponse({ status: 400, description: 'Order status not suitable for payment' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async createPaymentQr(@Param('id') orderId: number, @Ip() ipAddr: string) {
    const paymentUrl = await this.ordersService.createPaymentQr(orderId, ipAddr);
    return ApiResponseDto.success(paymentUrl, 'Get payment-url successfully');
  }

  @Get('vnpay-return')
  @Public()
  @ApiOperation({
    summary: 'VNPay return URL (frontend redirect)',
    description:
      'Called by VNPay via browser redirect after user completes payment. Used only for displaying payment result, not for updating order.',
  })
  @ApiResponse({ status: 200, description: 'Payment result returned successfully' })
  async handleVnpayReturn(@Query() query: any) {
    const result = await this.ordersService.handleVnpayReturn(query);
    if (!result.isSuccess) {
      return ApiResponseDto.error(result.message || 'Payment failed');
    }
    return ApiResponseDto.success(result.data, 'Payment processed');
  }
}

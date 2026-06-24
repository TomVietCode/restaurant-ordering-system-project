import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { OrderStatus, PaymentMethod } from '@common/enums.js';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: [OrderStatus.PREPARING, OrderStatus.SERVED, OrderStatus.PAID, OrderStatus.CANCEL],
    description: 'Target order status',
  })
  @IsEnum(OrderStatus, { message: 'Status must be PREPARING, SERVED, PAID, or CANCEL' })
  status: OrderStatus;

  @ApiPropertyOptional({ example: 'Customer changed their mind', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  cancelReason?: string;

  @ApiPropertyOptional({ enum: PaymentMethod, description: 'Required when status = PAID' })
  @IsOptional()
  @IsEnum(PaymentMethod, { message: 'Payment method must be CASH or TRANSFER' })
  paymentMethod?: PaymentMethod;
}

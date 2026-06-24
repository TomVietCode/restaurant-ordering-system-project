import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PaymentMethod } from '@common/enums.js';

export class CheckoutTableDto {
  @ApiProperty({ enum: PaymentMethod, description: 'Payment method for all orders at this table' })
  @IsEnum(PaymentMethod, { message: 'Payment method must be CASH or TRANSFER' })
  paymentMethod: PaymentMethod;
}

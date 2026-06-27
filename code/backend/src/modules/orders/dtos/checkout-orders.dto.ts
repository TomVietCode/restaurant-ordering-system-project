import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, IsInt, IsEnum, IsNotEmpty, ArrayMinSize } from 'class-validator';
import { PaymentMethod } from '@common/enums.js';

export class CheckoutOrdersDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Table UUID',
  })
  @IsUUID()
  @IsNotEmpty()
  tableId: string;

  @ApiProperty({
    example: [1, 2],
    description: 'Array of Order IDs to checkout',
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Must provide at least one order ID to checkout' })
  @IsInt({ each: true, message: 'Each order ID must be an integer' })
  orderIds: number[];

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method for these orders' })
  @IsEnum(PaymentMethod, { message: 'Payment method must be CASH or TRANSFER' })
  paymentMethod: PaymentMethod;
}

import { IsEnum, IsNumber } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

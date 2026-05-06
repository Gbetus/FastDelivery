import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  customerNombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  customerTelefono?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(500)
  customerDireccionEntrega: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notasPedido?: string;
}

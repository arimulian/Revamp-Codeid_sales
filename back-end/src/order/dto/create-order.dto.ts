/* eslint-disable prettier/prettier */
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';
export class CreateOrderDto {
  @IsInt()
  @Type(() => Number)
  user: number;
  trpaCodeNumber: string;
}

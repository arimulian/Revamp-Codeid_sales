/* eslint-disable prettier/prettier */
import { IsNotEmpty } from 'class-validator';

export class SummaryOrderrDto {
  @IsNotEmpty()
  orderNumber: string;
  id: number;
}

/* eslint-disable prettier/prettier */
import { IsNotEmpty } from 'class-validator';

export class FintechDto {
  @IsNotEmpty()
  accountNumber: string;
}

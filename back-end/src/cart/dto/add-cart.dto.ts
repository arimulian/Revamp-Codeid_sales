/* eslint-disable prettier/prettier */

import { IsNotEmpty } from 'class-validator';

/* eslint-disable prettier/prettier */
export class AddToCartDto {
  @IsNotEmpty()
  caitQuantity: number;
  @IsNotEmpty()
  userId: number;
  @IsNotEmpty()
  programId: number;
}

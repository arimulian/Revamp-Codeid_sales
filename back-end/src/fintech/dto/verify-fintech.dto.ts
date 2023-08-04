import { IsNotEmpty } from 'class-validator';

export class verifyFintechDto {
  @IsNotEmpty()
  accountNumber: string;
}

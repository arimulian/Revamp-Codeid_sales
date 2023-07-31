/* eslint-disable prettier/prettier */
import { Type } from 'class-transformer';
import { IsEmpty, IsInt, IsString } from 'class-validator';

/* eslint-disable prettier/prettier */
export class CreateBookDto {
  @IsString()
  @IsEmpty()
  title: string;
  @IsString()
  @IsEmpty()
  author: string;
  @IsInt()
  @IsEmpty()
  @Type(() => Number)
  year: string;
}

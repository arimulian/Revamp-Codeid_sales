/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItems } from 'src/entities/CartItems';
import { ProgramEntity } from 'src/entities/ProgramEntity';
import { Users } from 'src/entities/Users';

@Module({
  imports: [TypeOrmModule.forFeature([CartItems, ProgramEntity, Users])],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}

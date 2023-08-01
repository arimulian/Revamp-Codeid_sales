import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItems } from 'output/entities/CartItems';

@Module({
  imports: [TypeOrmModule.forFeature([CartItems])],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}

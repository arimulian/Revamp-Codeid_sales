import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartService } from 'src/cart/cart.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesOrderHeader } from 'src/entities/SalesOrderHeader';
import { CartItems } from 'src/entities/CartItems';
import { ProgramEntity } from 'src/entities/ProgramEntity';
import { Users } from 'src/entities/Users';
import { TransactionPayment } from 'src/entities/TransactionPayment';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalesOrderHeader,
      CartItems,
      ProgramEntity,
      Users,
      TransactionPayment,
    ]),
  ],
  providers: [OrderService, CartService],
  controllers: [OrderController],
})
export class OrderModule {}

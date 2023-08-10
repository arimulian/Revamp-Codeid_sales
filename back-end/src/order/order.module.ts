import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesOrderHeader } from 'src/entities/SalesOrderHeader';
import { CartItems } from 'src/entities/CartItems';
import { ProgramEntity } from 'src/entities/ProgramEntity';
import { Users } from 'src/entities/Users';
import { TransactionPayment } from 'src/entities/TransactionPayment';
import { Status } from 'src/entities/Status';
import { UsersAccount } from 'src/entities/UsersAccount';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalesOrderHeader,
      CartItems,
      ProgramEntity,
      Users,
      TransactionPayment,
      Status,
      UsersAccount,
    ]),
  ],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}

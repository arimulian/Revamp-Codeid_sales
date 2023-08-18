import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from 'src/mail/mail.service';
import { SalesOrderHeader } from 'output/entities/SalesOrderHeader';
import { CartItems } from 'output/entities/CartItems';
import { ProgramEntity } from 'output/entities/ProgramEntity';
import { Status } from 'output/entities/Status';
import { TransactionPayment } from 'output/entities/TransactionPayment';
import { Users } from 'output/entities/Users';
import { UsersAccount } from 'output/entities/UsersAccount';

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
  providers: [OrderService, MailService],
  controllers: [OrderController],
})
export class OrderModule {}

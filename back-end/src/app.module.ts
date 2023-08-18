/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { CartModule } from './cart/cart.module';
import { FintechModule } from './fintech/fintech.module';
import { OrderModule } from './order/order.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    CartModule,
    FintechModule,
    OrderModule,
    MailModule,
  ],
})
export class AppModule {}

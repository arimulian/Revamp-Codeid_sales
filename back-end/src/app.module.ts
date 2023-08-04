/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { CartModule } from './cart/cart.module';
import { ProgramModule } from './program/program.module';
import { FintechModule } from './fintech/fintech.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    CartModule,
    ProgramModule,
    FintechModule,
    OrderModule,
  ],
})
export class AppModule {}

/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { SalesModule } from './sales/sales.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), SalesModule],
})
export class AppModule {}

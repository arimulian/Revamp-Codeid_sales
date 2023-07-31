/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { BooksModule } from './books/books.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { CartModule } from './cart/cart.module';
import { ProgramModule } from './program/program.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), BooksModule, CartModule, ProgramModule],
})
export class AppModule {}

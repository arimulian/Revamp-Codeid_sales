/* eslint-disable @typescript-eslint/no-empty-function */
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/createBook.dto';
import { UpdateBookDto } from './dto/updateBook.dto';

@Controller('books')
export class BooksController {
  private bookService: BooksService;
  constructor(bookService: BooksService) {
    this.bookService = bookService;
  }
  @Get()
  findAll(): any[] {
    return this.bookService.getAllBook();
  }

  @Post()
  createBooks(@Body() payload: CreateBookDto) {
    return this.bookService.createBook(payload);
  }

  @Put(':id')
  updateBooks(@Param('id') id: string, @Body() payload: UpdateBookDto) {
    return this.bookService.updateBook(id, payload);
  }
}

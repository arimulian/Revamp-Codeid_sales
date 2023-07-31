import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateBookDto } from './dto/createBook.dto';
import { UpdateBookDto } from './dto/updateBook.dto';

@Injectable()
export class BooksService {
  private books: any[] = [];

  getAllBook(): any[] {
    return this.books;
  }
  createBook(createBookDto: CreateBookDto) {
    const { title, author, year } = createBookDto;
    return this.books.push({
      id: uuidv4(),
      title,
      author,
      year,
    });
  }
  findBook(id: string) {
    const books = this.books.findIndex((book) => book.id == id);
    if (books === -1) {
      throw new NotFoundException(`Book with id ${id} is not found`);
    }
    return books;
  }
  updateBook(id: string, updateBookDto: UpdateBookDto) {
    const { title, author, year } = updateBookDto;
    const bookIdx = this.findBook(id);
    (this.books[bookIdx].title = title),
      (this.books[bookIdx].author = author),
      (this.books[bookIdx].year = year);
  }
}

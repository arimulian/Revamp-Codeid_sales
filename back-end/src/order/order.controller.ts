import { Body, Controller, Get, Post, Query, UsePipes } from '@nestjs/common';
import { OrderService } from './order.service';
import { CartUserDto } from 'src/cart/dto/cart-user.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('api/order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  //   @Get()
  //   //   async findOrder(@Query() user: CartUserDto) {
  //   //     return this.orderService.createOrder(user);
  //   //   }
  @Post('create')
  async createOrder(@Body() user: CreateOrderDto) {
    return this.orderService.createOrder(user);
  }

  @Get('test')
  getNumber() {
    return this.orderService.generateOrderNumber();
  }
}

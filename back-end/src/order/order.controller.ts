import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderDto } from './dto/order.dto';
import { SummaryOrderrDto } from './dto/summary-order.dto';

@Controller('api/sales')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post('createOrder')
  async createOrder(@Body() user: OrderDto) {
    return this.orderService.createOrder(user);
  }
  @Post('cancelOrder')
  async cancelOrder(@Body() user: OrderDto) {
    return this.orderService.cancelOrder(user);
  }

  @Get('summaryOrder')
  async findOrder(@Query() orderNumber: SummaryOrderrDto) {
    return this.orderService.findOrder(orderNumber);
  }
}

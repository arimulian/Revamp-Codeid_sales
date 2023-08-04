/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CartUserDto } from './dto/cart-user.dto';
import { AddToCartDto } from './dto/add-cart.dto';

@Controller('api/programs/sales/cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  async findOne(@Query() id: CartUserDto) {
    const cartData = await this.cartService.getCart(id);
    return {
      data: cartData,
    };
  }

  @Post('add')
  addToCart(@Body() body: AddToCartDto) {
    return this.cartService.addToCart(body);
  }
  @Delete(':id')
  removeCart(@Param('id') id: number) {
    return this.cartService.removeCart(id);
  }
}
// @Controller('api/programs/sales/cart/add')
// export class AddToCartController {
//   constructor(private cartService: CartService) {}
//   @Post()
//   addToCart(@Body() body: AddToCartDto) {
//     return this.cartService.addToCart(body);
//   }
// }

// @Controller('api/programs/sales/discount')
// export class DiscountController{
//   constructor(private cartService: CartService){}

//   @Get()
//   createDisc(){
//     return this.cartService.
//   }
// }

import { Controller, Get, Query } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartUserDto } from './dto/cartUser.dto';

@Controller('api/programs/sales/cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  findOne(@Query() id: CartUserDto) {
    return this.cartService.getCartByUserId(id);
  }
}

// @Controller('api/programs/sales/discount')
// export class DiscountController{
//   constructor(private cartService: CartService){}

//   @Get()
//   createDisc(){
//     return this.cartService.
//   }
// }

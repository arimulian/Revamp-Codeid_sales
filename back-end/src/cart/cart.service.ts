/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItems } from 'src/entities/CartItems';
import { Repository } from 'typeorm';
import { CartUserDto } from './dto/cartUser.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItems)
    private readonly cartRepository: Repository<CartItems>,
  ) {}

  async getCartByUserId(id: CartUserDto) {
    const { userentityid } = id;
    try {
      if (!userentityid) {
        return new NotFoundException();
      } else {
        const query = await this.cartRepository
          .createQueryBuilder('cartItems')
          .leftJoinAndSelect('cartItems.caitUserEntity', 'cait_user')
          .leftJoinAndSelect('cartItems.caitProgEntity', 'cait_prog')
          .where('cartItems.caitUserEntity = :caitUserEntity ', {
            caitUserEntity: userentityid,
          })
          .getMany();
        if (query.length === 0) {
          return new NotFoundException();
        } else {
          return query;
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}

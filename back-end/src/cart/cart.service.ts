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
import { CartUserDto } from './dto/cart-user.dto';
import { AddToCartDto } from './dto/add-cart.dto';
import { ProgramEntity } from 'src/entities/ProgramEntity';
import { Users } from 'src/entities/Users';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItems)
    private readonly cartRepository: Repository<CartItems>,
    @InjectRepository(ProgramEntity)
    private readonly programRepository: Repository<ProgramEntity>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  async addToCart(addCart: AddToCartDto) {
    const { programId, caitQuantity, userId } = addCart;
    const cartItems = await this.cartRepository.find({
      relations: {
        caitProgEntity: true,
      },
    });
    const program = await this.programRepository.findOne({
      where: { progEntityId: programId },
    });
    const user = await this.userRepository.findOne({
      where: { userEntityId: userId },
      select: {
        userEntityId: true,
        userName: true,
        userFirstName: true,
        userLastName: true,
      },
    });
    // confirm the product exist
    if (program) {
      //confirm if user has item in cart
      const cart = cartItems.filter(
        (item) =>
          item.caitProgEntity.progEntityId === programId &&
          item.caitUserEntity.userEntityId === userId,
      );
      if (cart.length < 1) {
        const newItem = this.cartRepository.create({
          caitUnitPrice: program.progPrice * caitQuantity,
          caitQuantity: caitQuantity,
          caitModifiedDate: new Date(),
        });
        newItem.caitUserEntity = user;
        newItem.caitProgEntity = program;
        // console.log({ newItem });
        return await this.cartRepository.save(newItem);
      } else {
        //update the item quatity
        const caitQuantity = (cart[0].caitQuantity += 1);
        const caitUnitPrice = cart[0].caitUnitPrice * caitQuantity;
        return await this.cartRepository.update(cart[0].caitId, {
          caitQuantity,
          caitUnitPrice,
        });
      }
    }
    return null;
  }

  async getCart(cart: CartUserDto) {
    const { userentityid } = cart;
    try {
      if (!userentityid) {
        const query = this.cartRepository.find();
        return query;
      } else {
        const query = await this.cartRepository
          .createQueryBuilder('cartItems')
          .leftJoinAndSelect('cartItems.caitUserEntity', 'cait_user')
          .leftJoinAndSelect('cartItems.caitProgEntity', 'cait_prog')
          .where('cartItems.caitUserEntity = :caitUserEntity ', {
            caitUserEntity: userentityid,
          })
          .orderBy('cait_prog', 'ASC')
          .getMany();
        return query;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async removeCart(id: number) {
    const cart = await this.cartRepository.findOne({
      where: { caitId: id },
      relations: { caitUserEntity: true },
    });
    if (!cart) {
      throw new NotFoundException('NO DATA');
    }
    const query = await this.cartRepository.delete({
      caitId: id,
    });
    console.log(query);
  }
}

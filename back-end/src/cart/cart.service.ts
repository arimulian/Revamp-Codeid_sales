/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
  HttpStatus,
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

  /**
   * Adds an item to the cart.
   * @param addCart - The item to add to the cart.
   * @returns The added item if successful, otherwise null.
   */
  async addToCart(addCart: AddToCartDto) {
    const { programId, caitQuantity, userId } = addCart;

    // Fetch the cart items with their relations
    const cartItems = await this.cartRepository.find({
      relations: {
        caitProgEntity: true,
      },
    });

    // Fetch the program based on programId
    const program = await this.programRepository.findOne({
      where: { progEntityId: programId },
    });

    // Fetch the user based on userId and select required fields
    const user = await this.userRepository.findOne({
      where: { userEntityId: userId },
      select: {
        userEntityId: true,
        userName: true,
        userFirstName: true,
        userLastName: true,
      },
    });
    // Confirm that the program exists
    if (program) {
      // Confirm if the user has the item in the cart
      const cart = cartItems.filter(
        (item) =>
          item.caitProgEntity.progEntityId === programId &&
          item.caitUserEntity.userEntityId === userId,
      );
      if (cart.length < 1) {
        // Create a new item in the cart
        const total = program.progPrice * caitQuantity;
        const newItem = this.cartRepository.create({
          caitUnitPrice: total.toLocaleString('id-ID'),
          caitQuantity: caitQuantity,
          caitModifiedDate: new Date(),
        });

        newItem.caitUserEntity = user;
        newItem.caitProgEntity = program;
        console.log(newItem);
        // return await this.cartRepository.save(newItem);
      } else {
        const newTotal = cart[0].caitUnitPrice;
        // Update the item quantity
        const updatedQuantity = (cart[0].caitQuantity += 1);
        const updatedUnitPrice = parseInt(newTotal) * updatedQuantity;

        return await this.cartRepository.update(cart[0].caitId, {
          caitQuantity: updatedQuantity,
          caitUnitPrice: updatedUnitPrice.toLocaleString('id-ID'),
        });
      }
    }

    return { Message: 'Program does not exist' };
  }

  /**
   * Retrieves the cart items based on the given cart user.
   * If the userentityid is provided, it will filter the cart items for that user.
   * If the userentityid is not provided, it will return all cart items.
   *
   * @param cart - The cart user object.
   * @returns The cart items matching the filter criteria.
   * @throws {InternalServerErrorException} If an error occurs while retrieving the cart items.
   */
  async getCart(cart: CartUserDto) {
    const { userentityid } = cart;
    try {
      if (!userentityid) {
        // If userentityid is not provided, return all cart items
        const query = this.cartRepository.find();
        return query;
      } else {
        // If userentityid is provided, filter the cart items for that user
        const query = await this.cartRepository
          .createQueryBuilder('cartItems')
          .leftJoinAndSelect('cartItems.caitUserEntity', 'cait_user')
          .leftJoinAndSelect('cartItems.caitProgEntity', 'cait_prog')
          .where('cartItems.caitUserEntity = :caitUserEntity ', {
            caitUserEntity: userentityid,
          })
          .orderBy('cait_prog', 'ASC')
          .getMany();

        if (query.length < 1) {
          throw new NotFoundException(
            `cart does not exist in the user id: ${userentityid}`,
          );
        }
        return {
          status: HttpStatus.OK,
          count: query.length,
          data: query,
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Removes a cart with the given ID.
   * Throws NotFoundException if the cart is not found.
   * Returns a message indicating the cart has been deleted.
   * @param id - The ID of the cart to be removed.
   * @returns An object with a message indicating the cart has been deleted.
   */
  async removeCart(id: number) {
    // Find the cart with the given ID
    const cart = await this.cartRepository.findOne({
      where: { caitId: id },
      relations: { caitUserEntity: true },
    });

    // Throw NotFoundException if the cart is not found
    if (!cart) {
      throw new NotFoundException('cart not found');
    }

    // Delete the cart with the given ID
    await this.cartRepository.delete({
      caitId: id,
    });

    // Return a message indicating the cart has been deleted
    return { Message: `cart with id: ${id} deleted` };
  }
}
